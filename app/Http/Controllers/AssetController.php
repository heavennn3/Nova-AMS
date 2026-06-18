<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with(['category', 'type', 'vendor', 'location', 'site', 'activeAssignment.user'])->latest()->get()->map(function ($asset) {
            $data = [
                'id' => $asset->id,
                'asset_id' => $asset->asset_id,
                'category' => $asset->category ? $asset->category->name : '',
                'type' => $asset->type ? $asset->type->name : '',
                'site' => $asset->site ? $asset->site->name : ($asset->location ? $asset->location->name : ''),
                'site_id' => $asset->site_id,
                'quantity' => $asset->quantity,
                'vendor' => $asset->vendor ? $asset->vendor->name : '',
                'product_name' => $asset->product_name,
                'purchase_year' => $asset->purchase_year,
                'status' => $asset->status,
                'assignment' => null,
            ];

            if ($asset->status === 'in_use' && $asset->activeAssignment) {
                $a = $asset->activeAssignment;
                $mins = (int) \Carbon\Carbon::parse($a->assigned_at)->diffInMinutes(now());
                $duration = $mins < 1 ? 'Just now' : ($mins < 60 ? "{$mins}m" : ($mins < 1440 ? sprintf('%dh %dm', intdiv($mins, 60), $mins % 60) : sprintf('%dd %dh', intdiv($mins, 1440), intdiv($mins % 1440, 60))));

                $data['assignment'] = [
                    'user_name' => $a->user?->name ?? 'Unknown',
                    'user_email' => $a->user?->email ?? '',
                    'assigned_at' => $a->assigned_at?->format('Y-m-d H:i'),
                    'duration' => $duration,
                    'remarks' => $a->remarks,
                ];
            }

            return $data;
        });

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'sites' => \App\Models\Site::all()
        ]);
    }

    public function inventory()
    {
        $assets = Asset::with(['category', 'type', 'vendor', 'location', 'site'])
            ->latest()
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'asset_id' => $asset->asset_id,
                    'category' => $asset->category ? $asset->category->name : '',
                    'type' => $asset->type ? $asset->type->name : '',
                    'site' => $asset->site ? $asset->site->name : ($asset->location ? $asset->location->name : ''),
                    'site_id' => $asset->site_id,
                    'quantity' => $asset->quantity,
                    'vendor' => $asset->vendor ? $asset->vendor->name : '',
                    'product_name' => $asset->product_name,
                    'purchase_year' => $asset->purchase_year,
                    'status' => $asset->status,
                ];
            });

        return Inertia::render('asset-inventory', [
            'assets' => $assets,
        ]);
    }

    public function create()
    {
        return Inertia::render('Assets/Create', [
            'categories' => \App\Models\AssetCategory::all(),
            'types' => \App\Models\AssetType::all(),
            'vendors' => \App\Models\Vendor::all(),
            'sites' => \App\Models\Site::all(),
            'locations' => \App\Models\Location::all(),
            'suppliers' => \App\Models\Supplier::all(),
            'statusLabels' => \App\Models\StatusLabel::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|unique:assets',
            'serial_number' => 'nullable|string',
            'product_name' => 'required|string',
            'asset_name' => 'nullable|string',
            'brand' => 'nullable|string',
            'category_id' => 'nullable|exists:asset_categories,id',
            'type_id' => 'nullable|exists:asset_types,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'location_id' => 'nullable|exists:locations,id',
            'purchase_year' => 'nullable|integer',
            'status' => 'required|string',
            'status_label_id' => 'nullable|exists:status_labels,id',
            'notes' => 'nullable|string',
            'warranty_months' => 'nullable|integer',
            'order_number' => 'nullable|string',
            'purchase_date' => 'nullable|date',
            'eol_date' => 'nullable|date',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_cost' => 'nullable|numeric',
        ]);

        $request->validate([
            'image' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        // Map status label to standard status enum for compatibility
        if (!empty($validated['status_label_id'])) {
            $statusLabel = \App\Models\StatusLabel::find($validated['status_label_id']);
            if ($statusLabel) {
                if ($statusLabel->type === 'deployable') {
                    $validated['status'] = 'available';
                } elseif ($statusLabel->type === 'pending') {
                    $validated['status'] = 'maintenance';
                } elseif ($statusLabel->type === 'archived' || $statusLabel->type === 'undeployable') {
                    $validated['status'] = 'retired';
                }
            }
        }

        $asset = Asset::create($validated);

        // Notify Admins
        $user = \Illuminate\Support\Facades\Auth::user();
        $admins = \App\Models\User::role('Admin')->get();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewAssetNotification($asset, $user->name));

        return redirect()->route('assets.index')->with('success', 'Asset created successfully.');
    }

    public function importBulk(Request $request)
    {
        $request->validate([
            'assets' => 'required|array',
            'site_id' => 'nullable|exists:sites,id'
        ]);

        $importedCount = 0;
        $selectedSiteId = $request->site_id;

        foreach ($request->assets as $row) {
            // Function to find value by prefix or exact match ignoring case and newlines
            $getValue = function($keys) use ($row) {
                foreach ($row as $k => $v) {
                    $cleanK = trim(preg_replace('/\s+/', ' ', strtolower($k)));
                    foreach ((array)$keys as $searchKey) {
                        if (str_contains($cleanK, strtolower($searchKey))) {
                            return $v;
                        }
                    }
                }
                return null;
            };

            $assetId = $getValue(['asset id', 'aset id', 'asset_id']);
            if (!$assetId) continue;

            $productName = $getValue(['product', 'product name']) ?? 'Unknown';
            $quantity = $getValue(['quantity', 'kuantiti']) ?? 1;
            $purchaseYear = $getValue(['purchase year', 'tahun']);

            // Resolve Category
            $categoryName = $getValue(['category', 'kategori aset']);
            $categoryId = null;
            if ($categoryName) {
                $category = \App\Models\AssetCategory::firstOrCreate(['name' => trim($categoryName)]);
                $categoryId = $category->id;
            }

            // Resolve Type
            $typeName = $getValue(['type', 'jenis aset']);
            $typeId = null;
            if ($typeName) {
                $type = \App\Models\AssetType::firstOrCreate(['name' => trim($typeName)]);
                $typeId = $type->id;
            }

            // Resolve Site/Location
            $siteId = $selectedSiteId;
            if (!$siteId) {
                $siteName = $getValue(['location', 'lokasi', 'site']);
                if ($siteName) {
                    $site = \App\Models\Site::firstOrCreate(
                        ['name' => trim($siteName)], 
                        ['code' => strtoupper(substr(trim($siteName), 0, 3)) . '-' . rand(1000, 9999)]
                    );
                    $siteId = $site->id;
                }
            }

            // Resolve Vendor
            $vendorName = $getValue(['vendor', 'pembekal']);
            $vendorId = null;
            if ($vendorName) {
                $vendor = \App\Models\Vendor::firstOrCreate(['name' => trim($vendorName)]);
                $vendorId = $vendor->id;
            }

            // Create or Update
            Asset::withoutGlobalScope('site_access')->updateOrCreate(
                ['asset_id' => trim($assetId)],
                [
                    'product_name' => trim($productName),
                    'quantity' => (int)$quantity,
                    'purchase_year' => $purchaseYear,
                    'category_id' => $categoryId,
                    'type_id' => $typeId,
                    'site_id' => $siteId,
                    'vendor_id' => $vendorId,
                    'status' => 'available' // default
                ]
            );

            $importedCount++;
        }

        return redirect()->back()->with('success', "Successfully imported $importedCount assets!");
    }

    public function show(Asset $asset)
    {
        $asset->load([
            'category', 
            'type', 
            'vendor', 
            'location', 
            'site', 
            'supplier', 
            'statusLabel', 
            'assignments.user', 
            'assignments.location', 
            'audits.user'
        ]);

        $users = \App\Models\User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
            'users' => $users,
        ]);
    }

    public function edit(Asset $asset)
    {
        return Inertia::render('Assets/Edit', [
            'asset' => $asset,
            'categories' => \App\Models\AssetCategory::all(),
            'types' => \App\Models\AssetType::all(),
            'vendors' => \App\Models\Vendor::all(),
            'sites' => \App\Models\Site::all(),
            'locations' => \App\Models\Location::all(),
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_id' => 'required|unique:assets,asset_id,' . $asset->id,
            'serial_number' => 'nullable|string',
            'product_name' => 'required|string',
            'brand' => 'nullable|string',
            'category_id' => 'nullable|exists:asset_categories,id',
            'type_id' => 'nullable|exists:asset_types,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'purchase_year' => 'nullable|integer',
            'status' => 'required|string',
            'condition_status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $asset->update($validated);

        return redirect()->route('assets.index')->with('success', 'Asset updated successfully.');
    }

    public function exportMySQL()
    {
        $assets = Asset::with(['category', 'site', 'vendor'])->get();
        $filename = "asset_inventory_" . date('Y-m-d') . ".sql";
        $headers = [
            "Content-Type" => "application/sql",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function() use ($assets) {
            echo "-- Asset Inventory Export\n";
            echo "SET foreign_key_checks = 0;\n";
            foreach ($assets as $asset) {
                $fields = [
                    $asset->id,
                    "'" . addslashes($asset->asset_id) . "'",
                    $asset->category_id ?? 'NULL',
                    $asset->type_id ?? 'NULL',
                    $asset->site_id ?? 'NULL',
                    $asset->quantity ?? 0,
                    "'" . addslashes($asset->vendor ? $asset->vendor->name : '') . "'",
                    "'" . addslashes($asset->product_name) . "'",
                    "'" . addslashes($asset->purchase_year) . "'",
                    "'" . addslashes($asset->status) . "'",
                ];
                $values = implode(', ', $fields);
                echo "INSERT INTO assets (id, asset_id, category_id, type_id, site_id, quantity, vendor, product_name, purchase_year, status) VALUES ($values);\n";
            }
            echo "SET foreign_key_checks = 1;\n";
        };
        return response()->stream($callback, 200, $headers);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }



public function dashboard()
{
    $totalAssets = Asset::count();
    $availableAssets = Asset::where('status', 'available')->count();
    $inUseAssets = Asset::where('status', 'in_use')->count();
    $underMaintenance = Asset::where('status', 'under_maintenance')->count();
    $faultyAssets = Asset::where('status', 'faulty')->count();

    // Group assets by category for the bar chart
    $categoryData = \App\Models\AssetCategory::withCount('assets')->get()->map(function($cat) {
        return [
            'name' => $cat->name,
            'count' => $cat->assets_count
        ];
    });

    // Group assets by site for the site distribution
    $siteData = \App\Models\Site::withCount('assets')->get()->map(function($site) {
        return [
            'name' => $site->name,
            'count' => $site->assets_count
        ];
    });

    // Recent activities (simulated for now, could be audit logs)
    $recentActivities = \App\Models\Asset::with(['site', 'category'])->latest()->limit(5)->get()->map(function($asset) {
        return [
            'id' => $asset->id,
            'asset_id' => $asset->asset_id,
            'product_name' => $asset->product_name,
            'site' => $asset->site ? $asset->site->name : 'N/A',
            'status' => $asset->status,
            'time' => $asset->updated_at->diffForHumans()
        ];
    });

    return Inertia::render('dashboard', [
        'totalAssets' => $totalAssets,
        'availableAssets' => $availableAssets,
        'inUseAssets' => $inUseAssets,
        'underMaintenance' => $underMaintenance,
        'faultyAssets' => $faultyAssets,
        'categoryData' => $categoryData,
        'siteData' => $siteData,
        'recentActivities' => $recentActivities,
    ]);
}

/**
 * Process single asset scan - supports both new registration and existing lookup
 */
public function processScan(Request $request)
{
    $validated = $request->validate([
        'scanned_data' => 'required|string',
        'scan_type' => 'required|in:asset_id,serial_number,barcode',
        'site_id' => 'nullable|exists:sites,id',
    ]);

    $scannedValue = trim($validated['scanned_data']);
    $scanType = $validated['scan_type'];

    // Try to find existing asset
    $asset = Asset::withTrashed()
        ->where('asset_id', $scannedValue)
        ->orWhere('serial_number', $scannedValue)
        ->first();

    if ($asset) {
        return response()->json([
            'exists' => true,
            'deleted' => $asset->trashed(),
            'asset' => $asset->load(['category', 'type', 'vendor', 'site', 'location']),
            'message' => $asset->trashed() ? 'Asset exists but is deleted' : 'Asset already registered'
        ]);
    }

    // Parse JSON data if available
    $parsedData = $this->parseScannedData($scannedValue);

    return response()->json([
        'exists' => false,
        'scanned_data' => $parsedData,
        'message' => 'Valid scan - ready for registration'
    ]);
}

/**
 * Process bulk asset registration from scanned items
 */
public function processBulkScan(Request $request)
{
    $validated = $request->validate([
        'scanned_items' => 'required|array',
        'site_id' => 'nullable|exists:sites,id',
        'category_id' => 'nullable|exists:asset_categories,id',
        'status' => 'required|string',
    ]);

    $results = [
        'registered' => [],
        'duplicates' => [],
        'errors' => []
    ];

    foreach ($validated['scanned_items'] as $item) {
        try {
            $scannedData = is_string($item) ? $this->parseScannedData($item) : $item;
            $assetId = $scannedData['asset_id'] ?? null;

            if (!$assetId) {
                $results['errors'][] = ['item' => $item, 'message' => 'Missing asset_id'];
                continue;
            }

            // Check for existing asset
            $existing = Asset::where('asset_id', $assetId)->first();
            if ($existing) {
                $results['duplicates'][] = ['asset_id' => $assetId, 'asset' => $existing];
                continue;
            }

            // Create new asset
            $asset = Asset::create([
                'asset_id' => $assetId,
                'serial_number' => $scannedData['serial'] ?? null,
                'product_name' => $scannedData['name'] ?? 'Unknown',
                'category_id' => $scannedData['category_id'] ?? $validated['category_id'],
                'site_id' => $scannedData['site_id'] ?? $validated['site_id'],
                'status' => $validated['status'],
            ]);

            $results['registered'][] = $asset;

        } catch (\Exception $e) {
            $results['errors'][] = ['item' => $item, 'message' => $e->getMessage()];
        }
    }

    return response()->json([
        'message' => 'Processed ' . count($validated['scanned_items']) . ' items',
        'results' => $results
    ]);
}

/**
 * Validate scanned data format
 */
public function validateScan(Request $request, $scannedValue)
{
    $asset = Asset::withTrashed()
        ->where('asset_id', $scannedValue)
        ->orWhere('serial_number', $scannedValue)
        ->first();

    if ($asset) {
        return response()->json([
            'exists' => true,
            'deleted' => $asset->trashed(),
            'asset' => $asset,
            'message' => $asset->trashed() ? 'Asset exists but is deleted' : 'Asset already registered'
        ]);
    }

    // Validate format
    if (!preg_match('/^[A-Z]{3}-\d{6}$/', $scannedValue)) {
        return response()->json([
            'valid' => false,
            'message' => 'Invalid asset ID format. Expected format: ATM-123456'
        ]);
    }

    return response()->json([
        'valid' => true,
        'message' => 'Valid asset ID - ready for registration'
    ]);
}

/**
 * Lookup existing asset by scanned value
 */
public function lookupAsset(Request $request, $scannedValue)
{
    $asset = Asset::with(['category', 'type', 'vendor', 'site', 'location', 'activeAssignment.user'])
        ->where('asset_id', $scannedValue)
        ->orWhere('serial_number', $scannedValue)
        ->first();

    if (!$asset) {
        return response()->json([
            'found' => false,
            'message' => 'Asset not found'
        ], 404);
    }

    return response()->json([
        'found' => true,
        'asset' => $asset,
        'message' => 'Asset found successfully'
    ]);
}

/**
 * Parse scanned data - handles both simple strings and JSON data
 */
private function parseScannedData($scannedValue)
{
    // Try to parse as JSON first
    $decoded = json_decode($scannedValue, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return [
            'asset_id' => $decoded['asset_id'] ?? null,
            'name' => $decoded['name'] ?? null,
            'serial' => $decoded['serial'] ?? null,
            'category' => $decoded['category'] ?? null,
        ];
    }

    // Treat as simple asset_id or serial_number
    return [
        'asset_id' => $scannedValue,
        'name' => null,
        'serial' => null,
        'category' => null,
    ];
}
}