<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Site;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $siteId = $request->query('site_id');

        if (!$siteId) {
            $firstSite = \App\Models\Site::orderBy('name')->first();
            if ($firstSite) {
                return redirect()->to('/asset-inventory?site_id=' . $firstSite->id);
            }
        }
        $assetsQuery = Asset::with('category', 'type', 'oem', 'site')->latest();
        if ($siteId) {
            $assetsQuery->where('site_id', $siteId);
        }
        $assets = $assetsQuery->get()->map(function ($asset) {
            return [
                'id' => $asset->id,
                'site_id' => $asset->site_id,
                'asset_id' => $asset->asset_id,
                'asset_name' => $asset->asset_name,
                'category' => $asset->category?->name,
                'type' => $asset->type?->name,
                'location' => $asset->location,
                'oem' => $asset->oem?->name,
                'purchase_year' => $asset->purchase_year,
                'serial_number' => $asset->serial_number,
                'part_number' => $asset->part_number,
                'quantity' => $asset->quantity,
                'status' => $asset->status?->name,
                'status_color' => $asset->status?->color,
                'status_id' => $asset->status_id,
                'site' => $asset->site?->name,
            ];
        });

        return redirect()->route('asset-inventory');
    }
    public function inventory(Request $request)
    {
        $user = $request->user();
        $siteId = $request->query('site_id');

        if ($siteId === 'all') {
            $siteId = null;
        }

        if ($user && !$user->hasRole('Admin') && !$user->hasRole('Manager')) {
            $siteId = $user->site_id;
        }

        $assetsQuery = Asset::with('category', 'type', 'oem', 'site', 'activeLoan.user')->latest();

        if ($siteId) {
            $assetsQuery->where('site_id', $siteId);
        }

        $assets = $assetsQuery->get()->map(function ($asset) {
            $loan = $asset->activeLoan;
            $overdue = $loan && $loan->expected_return_date && $loan->expected_return_date->isPast();
            return [
                'id' => $asset->id,
                'site_id' => $asset->site_id,
                'asset_id' => $asset->asset_id,
                'asset_name' => $asset->asset_name,
                'category_id' => $asset->category_id,
                'type_id' => $asset->type_id,
                'oem_id' => $asset->oem_id,
                'category' => $asset->category?->name,
                'type' => $asset->type?->name,
                'location' => $asset->location,
                'oem' => $asset->oem?->name,
                'purchase_year' => $asset->purchase_year,
                'serial_number' => $asset->serial_number,
                'part_number' => $asset->part_number,
                'quantity' => $asset->quantity,
                'status' => $asset->status?->name,
                'status_color' => $asset->status?->color,
                'status_id' => $asset->status_id,
                'site' => $asset->site?->name,
                'loan_status' => $loan ? ($overdue ? 'overdue' : 'on_loan') : null,
                'loan_user_name' => $loan?->user?->name,
                'loan_return_date' => $loan?->expected_return_date?->format('Y-m-d'),
                'loan_id' => $loan?->id,
            ];
        });

        return Inertia::render('asset-inventory', [
            'assets' => $assets,
            'sites' => \App\Models\Site::orderBy('name')->get(['id', 'name']),
            'categories' => \App\Models\AssetCategory::orderBy('name')->get(['id', 'name']),
            'types' => \App\Models\AssetType::orderBy('name')->get(['id', 'name']),
            'oems' => \App\Models\Oem::orderBy('name')->get(['id', 'name']),
            'totalSites' => \App\Models\Site::count(),
            'typeSummary' => \App\Models\AssetType::withCount('assets')->orderBy('name')->get(['id', 'name']),
            'totalRecentAdded' => Asset::where('created_at', '>=', now()->subDays(30))->count(),
            'currentSiteId' => $siteId ? (int)$siteId : null,
            'assetStatuses' => \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color']),
            'loanStats' => [
                'active' => \App\Models\AssetLoan::where('status', 'approved')->count(),
                'overdue' => \App\Models\AssetLoan::where('status', 'approved')
                    ->where('expected_return_date', '<', now())->count(),
                'pending' => \App\Models\AssetLoan::where('status', 'pending')->count(),
            ],
        ]);
    }
    public function create()
    {
        return Inertia::render('Assets/Create', [
            'categories' => \App\Models\AssetCategory::orderBy('name')->get(['id', 'name']),
            'types' => \App\Models\AssetType::orderBy('name')->get(['id', 'name']),
            'oems' => \App\Models\Oem::orderBy('name')->get(['id', 'name']),
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|string|max:255',
            'asset_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:asset_categories,id',
            'type_id' => 'nullable|integer|exists:asset_types,id',
            'oem_id' => 'nullable|integer|exists:oems,id',
            'location' => 'nullable|string|max:255',
            'purchase_year' => 'nullable|integer|min:1900|max:2099',
            'serial_number' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'site_id' => 'nullable|integer|exists:sites,id',
        ]);

        $asset = Asset::create($validated);

        if ($request->input('return_to') === 'asset-inventory') {
            return redirect()->route('asset-inventory')->with('success', 'Asset created successfully.');
        }

        return redirect()->route('asset-inventory')->with('success', 'Asset created successfully.');
    }

    public function show(Asset $asset)
    {
        $asset->load('category', 'type', 'oem', 'site', 'assignments.user', 'assignments.location', 'audits.user', 'activeLoan.user', 'loans.user');

        $siteNames = Site::pluck('name', 'id');
        $asset->setAttribute('site_movements', $asset->audits
            ->filter(fn ($audit) => $audit->event === 'updated' && array_key_exists('site_id', $audit->old_values ?? []) && array_key_exists('site_id', $audit->new_values ?? []))
            ->map(fn ($audit) => [
                'id' => $audit->id,
                'from_site' => $siteNames[$audit->old_values['site_id']] ?? 'Unknown Site',
                'to_site' => $siteNames[$audit->new_values['site_id']] ?? 'Unknown Site',
                'moved_by' => $audit->user?->name ?? 'System',
                'moved_at' => $audit->created_at?->toIso8601String(),
            ])
            ->values());

        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
            'users' => $users,
        ]);
    }

    public function updateImage(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:4096',
        ]);

        if ($asset->image_path) {
            Storage::disk('public')->delete($asset->image_path);
        }

        $path = $validated['image']->store('assets', 'public');
        $asset->update(['image_path' => $path]);

        return redirect()->back()->with('success', 'Asset image updated.');
    }

    public function edit(Asset $asset)
    {
        return Inertia::render('Assets/Edit', [
            'asset' => $asset,
            'categories' => \App\Models\AssetCategory::orderBy('name')->get(['id', 'name']),
            'types' => \App\Models\AssetType::orderBy('name')->get(['id', 'name']),
            'oems' => \App\Models\Oem::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_id' => 'required|string|max:255',
            'asset_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:asset_categories,id',
            'type_id' => 'nullable|integer|exists:asset_types,id',
            'oem_id' => 'nullable|integer|exists:oems,id',
            'location' => 'nullable|string|max:255',
            'purchase_year' => 'nullable|integer|min:1900|max:2099',
            'serial_number' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'site_id' => 'required|integer|exists:sites,id',
        ]);

        $asset->update($validated);

        if ($request->input('return_to') === 'asset-inventory') {
            return redirect()->route('asset-inventory')->with('success', 'Asset updated successfully.');
        }

        return redirect()->route('asset-inventory')->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }

    

    public function importBulk(Request $request)
    {
        $request->validate([
            'assets' => 'required|array',
            'site_id' => 'nullable|integer|exists:sites,id',
        ]);

        $siteId = $request->site_id;
        $errors = [];
        $importedCount = 0;
        $lineNum = 1;

        $headerMap = [
            'asset_id'       => 'asset_id',
            'asset_name'     => 'asset_name',
            'category'       => 'category_lookup',
            'type'           => 'type_lookup',
            'location'       => 'location',
            'oem'            => 'oem_lookup',
            'purchase_year'  => 'purchase_year',
            'serial_number'  => 'serial_number',
            'part_number'    => 'part_number',
            'quantity'       => 'quantity',
            'status'         => 'status',
        ];

        foreach ($request->assets as $row) {
            $lineNum++;

            $normalized = [];
            foreach ($row as $k => $v) {
                $normalized[preg_replace('/\s+/', '_', strtolower(trim($k)))] = trim((string)$v);
            }

            $mapped = [];
            foreach ($headerMap as $searchKey => $dbCol) {
                if (!empty($normalized[$searchKey])) {
                    $mapped[$dbCol] = $normalized[$searchKey];
                }
            }

            // Resolve or auto-create Category
            if (isset($mapped['category_lookup'])) {
                $catName = $mapped['category_lookup'];
                $cat = \App\Models\AssetCategory::firstOrCreate(['name' => $catName]);
                $mapped['category_id'] = $cat->id;
                unset($mapped['category_lookup']);
            }

            // Resolve or auto-create Type
            if (isset($mapped['type_lookup'])) {
                $typeName = $mapped['type_lookup'];
                $type = \App\Models\AssetType::firstOrCreate(['name' => $typeName]);
                $mapped['type_id'] = $type->id;
                unset($mapped['type_lookup']);
            }

            // Resolve or auto-create OEM
            if (isset($mapped['oem_lookup'])) {
                $oemName = $mapped['oem_lookup'];
                $oem = \App\Models\Oem::firstOrCreate(['name' => $oemName]);
                $mapped['oem_id'] = $oem->id;
                unset($mapped['oem_lookup']);
            }

            // Map CSV status name → status_id, default 1 (stored)
            if (!empty($mapped['status'])) {
                $statusRow = \App\Models\AssetStatus::where('name', $mapped['status'])->first();
                $mapped['status_id'] = $statusRow?->id ?? 1;
                unset($mapped['status']);
            } else {
                $mapped['status_id'] = 1;
            }

            $pkValue = $mapped['asset_id'] ?? null;
            if (!$pkValue) {
                $errors[] = "Row $lineNum: missing Asset ID, skipped";
                continue;
            }

            $existing = Asset::where('asset_id', $pkValue)->first();

            if ($existing) {
                if ($siteId) $mapped['site_id'] = (int)$siteId;
                $existing->update($mapped);
            } else {
                if ($siteId) $mapped['site_id'] = (int)$siteId;
                Asset::create($mapped);
            }

            $importedCount++;
        }

        $message = "Imported $importedCount assets.";
        if (!empty($errors)) {
            $message .= ' Warnings: ' . implode(' | ', $errors);
        }

        return redirect()->back()->with('success', $message);
    }

    public function updateStatus(Request $request, Asset $asset)
    {
        if (!auth()->user()?->hasRole('Admin')) {
            abort(403, 'Only admins can update asset status.');
        }

        $validated = $request->validate([
            'status_id' => 'required|integer|exists:asset_statuses,id',
        ]);

        $asset->update(['status_id' => $validated['status_id']]);

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
            'status_id' => 'required|integer|exists:asset_statuses,id',
        ]);

        $count = 0;
        foreach (Asset::withoutGlobalScope('site_access')->whereIn('id', $validated['ids'])->cursor() as $asset) {
            $asset->update(['status_id' => $validated['status_id']]);
            $count++;
        }

        return redirect()->back()->with('success', "Updated {$count} assets.");
    }

    // ─── CSV Export ────────────────────────────────────────────────

    public function exportCsv()
    {
        $columnKeys = ['asset_id', 'asset_name', 'category', 'type', 'location', 'oem', 'purchase_year', 'serial_number', 'part_number', 'quantity', 'status'];
        $headers = [
            'asset_id' => 'Asset ID',
            'asset_name' => 'Asset Name',
            'category' => 'Category',
            'type' => 'Type',
            'location' => 'Location',
            'oem' => 'OEM',
            'purchase_year' => 'Purchase Year',
            'serial_number' => 'Serial Number',
            'part_number' => 'Part Number',
            'quantity' => 'Quantity',
            'status' => 'Status',
        ];

        $assets = Asset::with('category', 'type', 'oem')->latest()->get();

        $filename = "asset_inventory_" . date('Y-m-d') . ".csv";
        $responseHeaders = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate",
        ];

        $callback = function () use ($assets, $columnKeys, $headers) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, array_values($headers));

            foreach ($assets as $asset) {
                $row = [
                    $asset->asset_id,
                    $asset->asset_name,
                    $asset->category?->name,
                    $asset->type?->name,
                    $asset->location,
                    $asset->oem?->name,
                    $asset->purchase_year,
                    $asset->serial_number,
                    $asset->part_number,
                    $asset->quantity,
                    $asset->status,
                ];
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

        return Inertia::render('dashboard', [
            'totalAssets' => $totalAssets,
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

        // Try to find by matching any field value (EAV or fixed column)
        $asset = Asset::with('fieldValues')
            ->where(function ($q) use ($scannedValue) {
                $q->whereHas('fieldValues', fn($q) => $q->where('value', $scannedValue))
                  ->orWhere('serial_number', $scannedValue)
                  ->orWhere('asset_name', $scannedValue)
                  ->orWhere('asset_id', $scannedValue);
            })
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

                $existing = Asset::where(function ($q) use ($assetId) {
                    $q->whereHas('fieldValues', fn($q) => $q->where('value', $assetId))
                      ->orWhere('serial_number', $assetId)
                      ->orWhere('asset_name', $assetId)
                      ->orWhere('asset_id', $assetId);
                })->first();
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
            ->where(function ($q) use ($scannedValue) {
                $q->whereHas('fieldValues', fn($q) => $q->where('value', $scannedValue))
                  ->orWhere('serial_number', $scannedValue)
                  ->orWhere('asset_name', $scannedValue)
                  ->orWhere('asset_id', $scannedValue);
            })
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
