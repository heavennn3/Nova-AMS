<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\TableConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->query('site_id');

        // Default to first site if none selected
        if (!$siteId) {
            $firstSite = \App\Models\Site::orderBy('name')->first();
            if ($firstSite) {
                return redirect()->to('/assets?site_id=' . $firstSite->id);
            }
        }

        $configs = TableConfiguration::getAllColumns('assets', $siteId ? (int)$siteId : null);

        $assetsQuery = Asset::with('fieldValues')->latest();
        if ($siteId) {
            $assetsQuery->where('site_id', $siteId);
        }
        $assets = $assetsQuery->get()->map(function ($asset) use ($configs) {
            $fields = $asset->getFields();
            $row = ['id' => $asset->id, 'site_id' => $asset->site_id];
            foreach ($configs as $cfg) {
                $row[$cfg->column_key] = $fields[$cfg->column_key] ?? null;
            }
            $row['status'] = $fields['status'] ?? $asset->status;
            return $row;
        });

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'configurations' => $configs,
            'sites' => \App\Models\Site::orderBy('name')->get(['id', 'name']),
            'totalSites' => \App\Models\Site::count(),
            'totalFaulty' => \App\Models\AssetFieldValue::where('column_key', 'status')
                ->whereRaw('LOWER(value) IN (?, ?, ?, ?)', ['faulty', 'rusak', 'broken', 'damaged'])
                ->distinct('asset_id')
                ->count('asset_id'),
            'totalRecentAdded' => Asset::where('created_at', '>=', now()->subDays(30))->count(),
            'configuredSiteIds' => \App\Models\TableConfiguration::where('table_name', 'assets')
                ->whereNotNull('site_id')
                ->distinct('site_id')
                ->pluck('site_id'),
            'currentSiteId' => $siteId ? (int)$siteId : null,
            'assetStatuses' => \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color']),
        ]);
    }

    public function inventory(Request $request)
    {
        $siteId = $request->query('site_id');

        $configs = TableConfiguration::getAllColumns('assets', $siteId ? (int)$siteId : null);

        $assetsQuery = Asset::with('fieldValues')->latest();

        if ($siteId) {
            $assetsQuery->where('site_id', $siteId);
        }

        $assets = $assetsQuery->get()->map(function ($asset) use ($configs) {
            $fields = $asset->getFields();
            $row = [
                'id' => $asset->id,
                'site_id' => $asset->site_id,
            ];
            foreach ($configs as $cfg) {
                $row[$cfg->column_key] = $fields[$cfg->column_key] ?? null;
            }
            $row['lokasi'] = $fields['lokasi'] ?? null;
            $row['status'] = $fields['status'] ?? $asset->status;
            return $row;
        });

        return Inertia::render('asset-inventory', [
            'assets' => $assets,
            'configurations' => $configs,
            'sites' => \App\Models\Site::orderBy('name')->get(['id', 'name']),
            'currentSiteId' => $siteId ? (int)$siteId : null,
            'assetStatuses' => \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Assets/Create', [
            'configurations' => TableConfiguration::getAllColumns('assets'),
        ]);
    }

    public function store(Request $request)
    {
        $configs = TableConfiguration::getAllColumns('assets');

        $rules = [];
        foreach ($configs as $c) {
            $rules[$c->column_key] = $c->is_primary_key ? 'required|string' : 'nullable|string';
        }

        $validated = $request->validate($rules);

        $asset = Asset::create(['site_id' => $request->site_id]);
        $asset->syncFields($validated);

        return redirect()->route('assets.index')->with('success', 'Asset created successfully.');
    }

    public function show(Asset $asset)
    {
        $asset->load('fieldValues', 'assignments.user', 'assignments.location', 'audits.user');

        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();
        $configs = TableConfiguration::getAllColumns('assets');
        $fields = $asset->getFields();

        $row = ['id' => $asset->id, 'site_id' => $asset->site_id];
        foreach ($configs as $cfg) {
            $row[$cfg->column_key] = $fields[$cfg->column_key] ?? null;
        }

        return Inertia::render('Assets/Show', [
            'asset' => array_merge($row, $asset->toArray()),
            'users' => $users,
            'configurations' => $configs,
        ]);
    }

    public function edit(Asset $asset)
    {
        $asset->load('fieldValues');
        $configs = TableConfiguration::getAllColumns('assets');
        $fields = $asset->getFields();

        return Inertia::render('Assets/Edit', [
            'asset' => array_merge(['id' => $asset->id, 'site_id' => $asset->site_id], $fields),
            'configurations' => $configs,
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $configs = TableConfiguration::getAllColumns('assets');

        $rules = [];
        foreach ($configs as $c) {
            $rules[$c->column_key] = $c->is_primary_key ? 'required|string' : 'nullable|string';
        }

        $validated = $request->validate($rules);
        $asset->syncFields($validated);

        return redirect()->route('assets.index')->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }

    // ─── CSV Import ────────────────────────────────────────────────

    public function importBulk(Request $request)
    {
        $request->validate([
            'assets' => 'required|array',
            'site_id' => 'required|integer|exists:sites,id',
        ]);

        $siteId = $request->site_id;
        $configs = TableConfiguration::getAllColumns('assets', $siteId ? (int)$siteId : null);
        $columnKeys = $configs->pluck('column_key')->toArray();

        $importedCount = 0;

        foreach ($request->assets as $row) {
            $normalized = [];
            foreach ($row as $k => $v) {
                $normalized[strtolower(trim(preg_replace('/\s+/', '_', $k)))] = $v;
            }

            $mapped = [];
            foreach ($columnKeys as $ck) {
                $searchKey = strtolower($ck);
                if (array_key_exists($searchKey, $normalized)) {
                    $mapped[$ck] = $normalized[$searchKey];
                }
            }

            // Set default status if not provided
            if (empty($mapped['status'])) {
                $defaultS = \App\Models\AssetStatus::orderBy('sort_order')->first();
                $mapped['status'] = $defaultS ? $defaultS->name : 'not_updated';
            }

            // Find primary key
            $pkColumn = $configs->firstWhere('is_primary_key', true);
            $pkValue = $pkColumn ? ($mapped[$pkColumn->column_key] ?? null) : null;
            if (!$pkValue) continue;

            $existing = Asset::whereHas('fieldValues', function ($q) use ($pkColumn, $pkValue) {
                $q->where('column_key', $pkColumn->column_key)->where('value', $pkValue);
            })->first();

            if ($existing) {
                if ($siteId) $existing->update(['site_id' => $siteId]);
                $existing->syncFields($mapped);
            } else {
                $asset = Asset::create(['site_id' => $siteId ? (int)$siteId : null]);
                $asset->syncFields($mapped);
            }

            $importedCount++;
        }

        return redirect()->back()->with('success', "Successfully imported $importedCount assets!");
    }

    public function updateStatus(Request $request, Asset $asset)
    {
        if (!auth()->user()?->hasRole('Admin')) {
            abort(403, 'Only admins can update asset status.');
        }

        $validated = $request->validate([
            'status' => 'required|string|max:255',
        ]);

        $asset->setField('status', $validated['status']);
        $asset->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Asset status updated.');
    }

    public function statuses()
    {
        return response()->json(
            \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color'])
        );
    }

    public function bulkUpdateStatus(Request $request)
    {
        if (!auth()->user()?->hasRole('Admin')) {
            abort(403, 'Only admins can perform bulk status updates.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:assets,id',
            'status' => 'required|string|max:255',
        ]);

        $count = 0;
        foreach (Asset::withoutGlobalScope('site_access')->whereIn('id', $validated['ids'])->cursor() as $asset) {
            $asset->setField('status', $validated['status']);
            $count++;
        }

        return redirect()->back()->with('success', "Successfully updated status of $count assets!");
    }

    // ─── CSV Export ────────────────────────────────────────────────

    public function exportCsv()
    {
        $configs = TableConfiguration::getAllColumns('assets');
        $columnKeys = $configs->pluck('column_key')->toArray();
        $headers = $configs->pluck('column_title', 'column_key')->toArray();

        $assets = Asset::with('fieldValues')->latest()->get();

        $filename = "asset_inventory_" . date('Y-m-d') . ".csv";
        $responseHeaders = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate",
        ];

        $callback = function () use ($assets, $columnKeys, $headers) {
            $handle = fopen('php://output', 'w');

            // Header row using column titles
            fputcsv($handle, array_values($headers));

            foreach ($assets as $asset) {
                $fields = $asset->getFields();
                $row = [];
                foreach ($columnKeys as $ck) {
                    $row[] = $fields[$ck] ?? '';
                }
                fputcsv($handle, $row);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $responseHeaders);
    }

    // ─── Dashboard Stats ───────────────────────────────────────────

    public function dashboard()
    {
        $totalAssets = Asset::count();
        $configs = TableConfiguration::getAllColumns('assets');

        return Inertia::render('dashboard', [
            'totalAssets' => $totalAssets,
            'configurations' => $configs,
        ]);
    }

    // ─── Scan / Lookup (kept minimal) ──────────────────────────────

    public function processScan(Request $request)
    {
        $validated = $request->validate([
            'scanned_data' => 'required|string',
            'scan_type' => 'required|in:asset_id,serial_number,barcode',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $scannedValue = trim($validated['scanned_data']);

        // Try to find by matching any field value
        $asset = Asset::with('fieldValues')
            ->whereHas('fieldValues', fn($q) => $q->where('value', $scannedValue))
            ->first();

        if ($asset) {
            return response()->json([
                'exists' => true,
                'deleted' => $asset->trashed(),
                'asset' => array_merge(['id' => $asset->id], $asset->getFields()),
                'message' => $asset->trashed() ? 'Asset exists but is deleted' : 'Asset already registered',
            ]);
        }

        return response()->json([
            'exists' => false,
            'scanned_data' => ['asset_id' => $scannedValue],
            'message' => 'Valid scan - ready for registration',
        ]);
    }

    public function processBulkScan(Request $request)
    {
        $validated = $request->validate([
            'scanned_items' => 'required|array',
        ]);

        $results = ['registered' => [], 'duplicates' => [], 'errors' => []];

        foreach ($validated['scanned_items'] as $item) {
            try {
                $assetId = $item['asset_id'] ?? $item ?? null;
                if (!$assetId) {
                    $results['errors'][] = ['item' => $item, 'message' => 'Missing identifier'];
                    continue;
                }

                $existing = Asset::whereHas('fieldValues', fn($q) => $q->where('value', $assetId))->first();
                if ($existing) {
                    $results['duplicates'][] = ['asset_id' => $assetId, 'asset' => $existing];
                    continue;
                }

                $asset = Asset::create([]);
                $asset->setField('asset_id', $assetId);
                $results['registered'][] = $asset;
            } catch (\Exception $e) {
                $results['errors'][] = ['item' => $item, 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => 'Processed ' . count($validated['scanned_items']) . ' items',
            'results' => $results,
        ]);
    }

    public function lookupAsset($scannedValue)
    {
        $asset = Asset::with('fieldValues')
            ->whereHas('fieldValues', fn($q) => $q->where('value', $scannedValue))
            ->first();

        if (!$asset) {
            return response()->json(['found' => false, 'message' => 'Asset not found'], 404);
        }

        return response()->json([
            'found' => true,
            'asset' => array_merge(['id' => $asset->id], $asset->getFields()),
        ]);
    }
}