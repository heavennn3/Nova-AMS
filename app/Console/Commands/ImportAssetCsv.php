<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TableConfiguration;
use App\Models\Asset;

class ImportAssetCsv extends Command
{
    protected $signature = 'assets:import-csv {file} {--delimiter=,}';
    protected $description = 'Import assets from a CSV file using table configuration mapping';

    public function handle()
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: $file");
            return 1;
        }

        $configs = TableConfiguration::getAllColumns('assets');
        if ($configs->isEmpty()) {
            $this->error('No table configurations found for assets.');
            return 1;
        }

        $handle = fopen($file, 'r');
        if (!$handle) {
            $this->error("Cannot open file: $file");
            return 1;
        }

        $delimiter = $this->option('delimiter');
        if ($delimiter === 'auto') {
            $firstLine = fgets($handle);
            rewind($handle);
            $delimiter = str_contains($firstLine, "\t") ? "\t" : ',';
        }

        $rawHeader = fgetcsv($handle, 0, $delimiter);
        if (!$rawHeader) {
            $this->error('Empty or invalid CSV header');
            return 1;
        }

        $headers = array_map(function ($h) {
            return trim(preg_replace('/^\xEF\xBB\xBF/', '', $h));
        }, $rawHeader);

        $this->info("Detected columns: " . implode(', ', $headers));

        // Column matching strategies (in order of precedence)
        $headerToKey = [];
        foreach ($headers as $header) {
            $normalizedHeader = strtolower(trim(preg_replace('/\s+/', '_', $header)));

            // Strategy 1: exact match by column_title
            $config = $configs->first(function ($c) use ($header) {
                return strcasecmp(trim($c->column_title), trim($header)) === 0;
            });

            // Strategy 2: column_title matches first part before newline/paren
            if (!$config) {
                $short = trim(explode("\n", explode('(', $header)[0])[0]);
                if ($short !== $header) {
                    $config = $configs->first(function ($c) use ($short) {
                        return strcasecmp(trim($c->column_title), $short) === 0;
                    });
                }
            }

            // Strategy 3: match by normalized column_key
            if (!$config) {
                $config = $configs->first(function ($c) use ($normalizedHeader) {
                    return strtolower($c->column_key) === $normalizedHeader;
                });
            }

            // Strategy 4: normalized column_title match
            if (!$config) {
                $config = $configs->first(function ($c) use ($normalizedHeader) {
                    $titleNorm = strtolower(trim(preg_replace('/[\s_]+/', '_', $c->column_title)));
                    return $titleNorm === $normalizedHeader;
                });
            }

            if ($config) {
                $headerToKey[$header] = $config->column_key;
                $this->line("  ✓ \"{$header}\" → {$config->column_key}");
            } else {
                $this->warn("  ✗ \"{$header}\" → skipped");
            }
        }

        $pkConfig = $configs->firstWhere('is_primary_key', true);
        if (!$pkConfig) {
            $this->error('No primary key column configured.');
            return 1;
        }

        $imported = 0;
        $skipped = 0;
        $line = 1;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $line++;

            $mapped = [];
            foreach ($headers as $i => $header) {
                if (!isset($headerToKey[$header])) continue;
                $value = isset($row[$i]) ? trim($row[$i]) : '';
                if ($value === '') continue;
                $mapped[$headerToKey[$header]] = $value;
            }

            $pkValue = $mapped[$pkConfig->column_key] ?? null;

            // Skip if PK is numeric (likely row number) or empty
            if (!$pkValue || is_numeric($pkValue) && $pkValue < 1000) {
                $skipped++;
                continue;
            }

            $existing = Asset::whereHas('fieldValues', function ($q) use ($pkConfig, $pkValue) {
                $q->where('column_key', $pkConfig->column_key)->where('value', $pkValue);
            })->first();

            if ($existing) {
                $existing->syncFields($mapped);
                $this->line("  ~ Updated {$pkValue}");
            } else {
                $asset = Asset::create([]);
                $asset->syncFields($mapped);
                $this->line("  + Created {$pkValue}");
            }

            $imported++;
        }

        fclose($handle);

        $this->info("Done: {$imported} imported, {$skipped} skipped.");

        return 0;
    }
}
