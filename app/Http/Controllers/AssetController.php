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
                'condition_status' => $asset->condition_status,
                'serial_number' => $asset->serial_number,
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

        $user = auth()->user();
        if ($user && $user->hasRole('Admin')) {
            $sites = \App\Models\Site::all();
        } else {
            $sites = $user->sites;
            if ($sites->isEmpty() && $user->site_id) {
                $sites = \App\Models\Site::where('id', $user->site_id)->get();
            }
        }

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'sites' => $sites,
            'configurations' => \App\Models\TableConfiguration::getAllColumns('assets'),
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

        $configs = \App\Models\TableConfiguration::getAllColumns('assets');

        return Inertia::render('asset-inventory', [
            'assets' => $assets,
            'configurations' => $configs,
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
            'configurations' => \App\Models\TableConfiguration::getAllColumns('assets'),
        ]);
    }

    public function store(Request $request)
    {
        $configs = \App\Models\TableConfiguration::getAllColumns('assets');

        $rules = [];
        foreach ($configs as $c) {
            $dbField = $this->columnKeyToDbField($c->column_key);
            if (!$dbField) continue;
            if ($dbField === 'asset_id') {
                $rules[$c->column_key] = 'required|unique:assets';
            } elseif (str_ends_with($dbField, '_id')) {
                $table = $this->fkTable($dbField);
                $rules[$c->column_key] = $table ? "nullable|exists:{$table},id" : 'nullable|string';
            } else {
                $rules[$c->column_key] = match ($c->data_type) {
                    'number' => 'nullable|numeric',
                    'date' => 'nullable|date',
                    'boolean' => 'nullable|boolean',
                    default => 'nullable|string',
                };
            }
        }

        $validated = $request->validate($rules);

        $request->validate([
            'image' => 'nullable|image|max:4096',
        ]);

        // Map column_key to DB field names
        $data = [];
        foreach ($configs as $c) {
            $dbField = $this->columnKeyToDbField($c->column_key);
            if ($dbField && isset($validated[$c->column_key])) {
                $data[$dbField] = $validated[$c->column_key];
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('assets', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        // Map status_label to standard status enum for compatibility
        if (!empty($data['status_label_id'])) {
            $statusLabel = \App\Models\StatusLabel::find($data['status_label_id']);
            if ($statusLabel) {
                $data['status'] = match ($statusLabel->type) {
                    'deployable' => 'available',
                    'pending' => 'maintenance',
                    'archived', 'undeployable' => 'retired',
                    default => $data['status'] ?? 'available',
                };
            }
        }

        if (empty($data['status'])) $data['status'] = 'available';
        if (empty($data['product_name'])) $data['product_name'] = 'Unknown';

        $asset = Asset::create($data);

        // Notify Admins
        $user = \Illuminate\Support\Facades\Auth::user();
        $admins = \App\Models\User::role('Admin')->get();
        \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewAssetNotification($asset, $user->name));

        return redirect()->route('assets.index')->with('success', 'Asset created successfully.');
    }

    private function columnKeyToDbField(string $key): ?string
    {
        $direct = ['asset_id', 'serial_number', 'product_name', 'asset_name', 'brand', 'purchase_year', 'quantity', 'status', 'condition_status', 'notes', 'latitude', 'longitude', 'image_path', 'warranty_months', 'order_number', 'purchase_date', 'eol_date', 'purchase_cost'];
        $fk = [
            'category' => 'category_id',
            'type' => 'type_id',
            'vendor' => 'vendor_id',
            'site' => 'site_id',
            'location' => 'location_id',
            'supplier' => 'supplier_id',
            'status_label' => 'status_label_id',
        ];
        if (in_array($key, $direct)) return $key;
        return $fk[$key] ?? null;
    }

    private function fkTable(string $dbField): ?string
    {
        return match ($dbField) {
            'category_id' => 'asset_categories',
            'type_id' => 'asset_types',
            'vendor_id' => 'vendors',
            'site_id' => 'sites',
            'location_id' => 'locations',
            'supplier_id' => 'suppliers',
            'status_label_id' => 'status_labels',
            default => null,
        };
    }
    public function importBulk(Request $request)
    {
        $request->validate([
            'assets' => 'required|array',
            'site_id' => 'nullable|exists:sites,id'
        ]);

        $configs = \App\Models\TableConfiguration::getAllColumns('assets');
        $columnKeys = $configs->pluck('column_key')->toArray();

        $importedCount = 0;
        $selectedSiteId = $request->site_id;

        foreach ($request->assets as $row) {
            // Normalize CSV header keys: "Asset ID" → "asset_id"
            $normalized = [];
            foreach ($row as $k => $v) {
                $normalized[strtolower(trim(preg_replace('/\s+/', '_', $k)))] = $v;
            }

            // Map configured column_keys to CSV values
            $mapped = [];
            foreach ($columnKeys as $ck) {
                $searchKey = strtolower($ck);
                if (array_key_exists($searchKey, $normalized)) {
                    $mapped[$ck] = $normalized[$searchKey];
                }
            }

            $assetId = $mapped['asset_id'] ?? null;
            if (!$assetId) continue;

            $data = [];

            // Direct model fields
            foreach (['serial_number', 'product_name', 'asset_name', 'brand', 'status', 'condition_status', 'notes', 'purchase_year', 'quantity', 'warranty_months', 'order_number', 'purchase_date', 'eol_date', 'purchase_cost', 'latitude', 'longitude', 'image_path'] as $field) {
                if (isset($mapped[$field])) {
                    $data[$field] = $mapped[$field];
                }
            }

            // Defaults
            if (empty($data['product_name'])) $data['product_name'] = 'Unknown';
            if (empty($data['status'])) $data['status'] = 'available';
            if (isset($mapped['quantity'])) $data['quantity'] = (int) $mapped['quantity'];

            // Resolve lookup fields (CSV name → DB ID via firstOrCreate)
            if (!empty($mapped['category'])) {
                $cat = \App\Models\AssetCategory::firstOrCreate(['name' => trim($mapped['category'])]);
                $data['category_id'] = $cat->id;
            }
            if (!empty($mapped['type'])) {
                $type = \App\Models\AssetType::firstOrCreate(['name' => trim($mapped['type'])]);
                $data['type_id'] = $type->id;
            }
            if (!empty($mapped['vendor'])) {
                $vendor = \App\Models\Vendor::firstOrCreate(['name' => trim($mapped['vendor'])]);
                $data['vendor_id'] = $vendor->id;
            }
            if (!empty($mapped['supplier'])) {
                $supplier = \App\Models\Supplier::firstOrCreate(['name' => trim($mapped['supplier'])]);
                $data['supplier_id'] = $supplier->id;
            }
            if (!empty($mapped['location'])) {
                $loc = \App\Models\Location::firstOrCreate(['name' => trim($mapped['location'])]);
                $data['location_id'] = $loc->id;
            }
            if (!empty($mapped['status_label'])) {
                $sl = \App\Models\StatusLabel::firstOrCreate(['name' => trim($mapped['status_label'])]);
                $data['status_label_id'] = $sl->id;
            }

            // Site: prefer selected site from dialog, else resolve from CSV
            if ($selectedSiteId) {
                $data['site_id'] = $selectedSiteId;
            } elseif (!empty($mapped['site'])) {
                $site = \App\Models\Site::firstOrCreate(
                    ['name' => trim($mapped['site'])],
                    ['code' => strtoupper(substr(trim($mapped['site']), 0, 3)) . '-' . rand(1000, 9999)]
                );
                $data['site_id'] = $site->id;
            }

            Asset::withoutGlobalScope('site_access')->updateOrCreate(
                ['asset_id' => trim($assetId)],
                $data
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