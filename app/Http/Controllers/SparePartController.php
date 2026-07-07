<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use App\Models\SparePartCategory;
use App\Models\Checkout;
use App\Models\Site;
use App\Models\TableConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SparePartController extends Controller
{
    public function dashboard()
    {
        $totalParts = SparePart::count();
        $totalValue = SparePart::get()->sum(function ($part) {
            return $part->quantity * $part->unit_cost;
        });
        $availableParts = SparePart::where('status', 'available')->count();
        $lowStockParts = SparePart::whereRaw('quantity <= minimum_stock_level')->count();
        $outOfStockParts = SparePart::where('quantity', 0)->count();

        // Category breakdown by master data parent groups
        $parents = \App\Models\SparePartCategory::with('children')->whereNull('parent_id')->get();
        $categoryData = $parents->map(function ($parent) {
            $childNames = $parent->children->pluck('name')->toArray();
            $count = SparePart::whereIn('category', $childNames)->count();
            $value = SparePart::whereIn('category', $childNames)
                ->get()
                ->sum(fn($p) => $p->quantity * $p->unit_cost);
            return [
                'category' => $parent->name,
                'count' => $count,
                'value' => number_format($value, 2),
            ];
        });

        // Recent checkouts
        $recentCheckouts = Checkout::with(['sparePart', 'user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($checkout) {
                return [
                    'id' => $checkout->id,
                    'part_name' => $checkout->sparePart?->name ?? 'Unknown',
                    'user_name' => $checkout->user?->name ?? 'Unknown',
                    'quantity' => $checkout->quantity,
                    'checkout_date' => $checkout->checkout_date?->format('Y-m-d'),
                    'status' => $checkout->status,
                ];
            });

        // Low stock alerts
        $lowStockAlerts = SparePart::whereRaw('quantity <= minimum_stock_level')
            ->where('quantity', '>', 0)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($part) {
                return [
                    'name' => $part->name,
                    'stock_level' => $part->quantity,
                    'minimum_level' => $part->minimum_stock_level,
                    'location' => $part->location,
                ];
            });

        // All spare parts for filtered table display
        $allParts = SparePart::select('id', 'name', 'category', 'quantity', 'minimum_stock_level', 'location', 'status')
            ->latest()
            ->get();

        return Inertia::render('SpareParts/Dashboard', [
            'totalParts' => $totalParts,
            'totalValue' => number_format($totalValue, 2),
            'availableParts' => $availableParts,
            'lowStockParts' => $lowStockParts,
            'outOfStockParts' => $outOfStockParts,
            'categoryData' => $categoryData,
            'recentCheckouts' => $recentCheckouts,
            'lowStockAlerts' => $lowStockAlerts,
            'allParts' => $allParts,
        ]);
    }

    public function index()
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');

        $spareParts = SparePart::with(['site', 'assetType', 'fieldValues'])
            ->latest()
            ->get()
            ->map(function ($part) use ($configs) {
                $fields = $part->getFields();
                $row = ['id' => $part->id];
                foreach ($configs as $cfg) {
                    $row[$cfg->column_key] = $fields[$cfg->column_key] ?? $part->{$cfg->column_key} ?? null;
                }
                $row['site'] = $part->site?->name ?? 'N/A';
                $row['availability'] = $part->availability;
                $row['total_value'] = number_format($part->total_value, 2);
                $row['asset_type'] = $part->assetType?->name ?? '—';
                return $row;
            });

        $categories = SparePart::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category')
            ->sort()
            ->values();

        $assetTypes = \App\Models\AssetType::orderBy('name')->get();
        $sites = \App\Models\Site::orderBy('name')->get();

        return Inertia::render('SpareParts/Index', [
            'spareParts' => $spareParts,
            'configurations' => $configs,
            'categories' => $categories,
            'assetTypes' => $assetTypes,
            'sites' => $sites,
        ]);
    }

    public function store(Request $request)
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');

        $rules = [
            'part_number' => 'required|string|unique:spare_parts,part_number',
            'quantity' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'location' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
            'status' => 'required|string',
            'specifications' => 'nullable|array',
            'compatibility' => 'nullable|array',
            'asset_type_id' => 'nullable|exists:asset_types,id',
        ];
        // Dynamic field rules
        foreach ($configs as $c) {
            $rules[$c->column_key] = $c->is_primary_key ? 'required|string' : 'nullable|string';
        }

        $validated = $request->validate($rules);

        $dynamicFields = [];
        foreach ($configs as $c) {
            if (array_key_exists($c->column_key, $validated)) {
                $dynamicFields[$c->column_key] = $validated[$c->column_key];
                unset($validated[$c->column_key]);
            }
        }

        $validated['specifications'] = $validated['specifications'] ?? [];
        $validated['compatibility'] = $validated['compatibility'] ?? [];

        $sparePart = SparePart::create($validated);
        $sparePart->syncFields($dynamicFields);

        return redirect()->back()->with('success', 'Spare part added successfully.');
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');

        $rules = [
            'part_number' => 'required|string|unique:spare_parts,part_number,' . $sparePart->id,
            'quantity' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'location' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
            'status' => 'required|string',
            'specifications' => 'nullable|array',
            'compatibility' => 'nullable|array',
            'asset_type_id' => 'nullable|exists:asset_types,id',
        ];
        foreach ($configs as $c) {
            $rules[$c->column_key] = $c->is_primary_key ? 'required|string' : 'nullable|string';
        }

        $validated = $request->validate($rules);

        $dynamicFields = [];
        foreach ($configs as $c) {
            if (array_key_exists($c->column_key, $validated)) {
                $dynamicFields[$c->column_key] = $validated[$c->column_key];
                unset($validated[$c->column_key]);
            }
        }

        $validated['specifications'] = $validated['specifications'] ?? [];
        $validated['compatibility'] = $validated['compatibility'] ?? [];

        $sparePart->update($validated);
        $sparePart->syncFields($dynamicFields);

        return redirect()->back()->with('success', 'Spare part updated successfully.');
    }

    public function destroy(SparePart $sparePart)
    {
        $sparePart->delete();
        return redirect()->back()->with('success', 'Spare part deleted successfully.');
    }

    public function checkout(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1|max:' . $sparePart->quantity,
            'purpose' => 'nullable|string',
            'expected_return_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Update stock level
        $sparePart->decrement('quantity', $validated['quantity']);

        // Create checkout record
        Checkout::create([
            'spare_part_id' => $sparePart->id,
            'user_id' => $validated['user_id'],
            'quantity' => $validated['quantity'],
            'purpose' => $validated['purpose'] ?? '',
            'checkout_date' => now(),
            'expected_return_date' => $validated['expected_return_date'] ?? null,
            'status' => 'checked_out',
            'notes' => $validated['notes'] ?? '',
        ]);

        return redirect()->back()->with('success', 'Spare part checked out successfully.');
    }

    public function returnCheckout(Request $request, Checkout $checkout)
    {
        // Update stock level
        $checkout->sparePart->increment('quantity', $checkout->quantity);

        // Update checkout record
        $checkout->update([
            'actual_return_date' => now(),
            'status' => 'returned',
        ]);

        return redirect()->back()->with('success', 'Spare part returned successfully.');
    }

    public function exportCsv()
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');
        $columnKeys = $configs->pluck('column_key')->toArray();
        $headers = $configs->pluck('column_title', 'column_key')->toArray();

        $spareParts = SparePart::with('fieldValues')->get();
        $filename = "spare_parts_" . date('Y-m-d') . ".csv";
        $responseHeaders = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=\"$filename\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function() use ($spareParts, $columnKeys, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, array_values($headers));

            foreach ($spareParts as $part) {
                $fields = $part->getFields();
                $row = [];
                foreach ($columnKeys as $ck) {
                    $row[] = $fields[$ck] ?? $part->{$ck} ?? '';
                }
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $responseHeaders);
    }

    public function importBulk(Request $request)
    {
        $request->validate([
            'spare_parts' => 'required|array',
        ]);

        $rows = $request->spare_parts;
        if (empty($rows)) {
            return redirect()->back()->with('error', 'No data to import.');
        }

        $firstRow = $rows[0];
        $headers = array_keys($firstRow);

        // ── Auto-create TableConfiguration if empty ──
        $existingConfigs = TableConfiguration::forTable('spare_parts')->count();
        if ($existingConfigs === 0) {
            $this->createConfigsFromHeaders($headers);
        }

        $fillable = (new SparePart)->getFillable();
        $configs = TableConfiguration::getAllColumns('spare_parts');
        $columnKeys = $configs->pluck('column_key')->toArray();
        $importedCount = 0;

        foreach ($rows as $row) {
            $normalized = [];
            foreach ($row as $k => $v) {
                $normalized[strtolower(trim(preg_replace('/\s+/', '_', $k)))] = $v;
            }

            if (empty($normalized)) continue;

            // Map normalized headers to fillable model fields
            $data = [];
            foreach ($normalized as $nk => $v) {
                $field = $this->mapHeaderToField($nk);
                if ($field && in_array($field, $fillable)) {
                    $data[$field] = $v;
                }
            }

            if (empty($data)) continue;

            $data['status'] ??= 'available';
            $data['quantity'] = (int)($data['quantity'] ?? 0);
            $data['minimum_stock_level'] = (int)($data['minimum_stock_level'] ?? 0);

            // Auto-register category in master data
            if (!empty($data['category'])) {
                $this->ensureCategory($data['category'], $normalized);
            }

            $part = SparePart::create($data);

            // Store remaining CSV columns as EAV field values
            $eavData = [];
            foreach ($columnKeys as $ck) {
                $mappedField = $this->mapHeaderToField($ck);
                if ($mappedField && in_array($mappedField, $fillable)) continue;
                // Also skip if it was already mapped and used in $data
                if (array_key_exists($ck, $normalized)) {
                    $eavData[$ck] = $normalized[$ck];
                }
            }
            if (!empty($eavData)) {
                $part->syncFields($eavData);
            }

            $importedCount++;
        }

        return redirect()->back()->with('success', "Successfully imported $importedCount spare parts!");
    }

    private function mapHeaderToField(string $normalizedKey): ?string
    {
        $map = [
            'name' => 'name',
            'part_name' => 'name',
            'item_name' => 'name',
            'part_id' => 'part_number',
            'part_number' => 'part_number',
            'quantity' => 'quantity',
            'stock_level' => 'quantity',
            'stock' => 'quantity',
            'minimum_stock' => 'minimum_stock_level',
            'minimum_stock_level' => 'minimum_stock_level',
            'min_stock' => 'minimum_stock_level',
            'storage_location' => 'location',
            'location' => 'location',
            'category' => 'category',
            'status' => 'status',
        ];
        return $map[$normalizedKey] ?? null;
    }

    private function createConfigsFromHeaders(array $headers): void
    {
        $sortOrder = 0;
        foreach ($headers as $header) {
            $columnKey = strtolower(trim(preg_replace('/\s+/', '_', $header)));
            // Skip headers that directly map to hardcoded columns (stock_level already hardcoded)
            $sortOrder++;
            TableConfiguration::create([
                'table_name' => 'spare_parts',
                'column_key' => $columnKey,
                'column_title' => $header,
                'data_type' => $this->inferDataType($columnKey),
                'is_primary_key' => $sortOrder === 1,
                'is_sortable' => true,
                'is_visible' => true,
                'sort_order' => $sortOrder * 10,
            ]);
        }
    }

    private function inferDataType(string $columnKey): string
    {
        $numberHints = ['quantity', 'stock', 'count', 'total', 'amount', 'price', 'cost', 'unit_cost', 'minimum_stock'];
        foreach ($numberHints as $hint) {
            if (str_contains($columnKey, $hint)) return 'number';
        }
        return 'text';
    }

    private function ensureCategory(string $categoryName, array $normalized): void
    {
        $subCategoryName = $normalized['subcategory'] ?? $normalized['sub_category'] ?? null;

        if ($subCategoryName) {
            // Category is parent, subcategory is child
            $parentCat = SparePartCategory::firstOrCreate(['name' => $categoryName]);
            SparePartCategory::firstOrCreate(
                ['name' => $subCategoryName],
                ['parent_id' => $parentCat->id]
            );
        } else {
            // Standalone top-level category
            SparePartCategory::firstOrCreate(['name' => $categoryName]);
        }
    }
}
