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

    public function create()
    {
        return Inertia::render('Assets/Create', [
            'categories' => \App\Models\AssetCategory::all(),
            'types' => \App\Models\AssetType::all(),
            'vendors' => \App\Models\Vendor::all(),
            'sites' => \App\Models\Site::all(),
            'locations' => \App\Models\Location::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|unique:assets',
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
            Asset::updateOrCreate(
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

    public function exportCsv()
    {
        $assets = Asset::with(['category', 'site', 'vendor'])->get();
        $filename = "asset_inventory_" . date('Y-m-d') . ".csv";
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Asset ID', 'Product Name', 'Category', 'Site', 'Status', 'Quantity', 'Purchase Year', 'Vendor'];

        $callback = function() use($assets, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->asset_id,
                    $asset->product_name,
                    $asset->category?->name,
                    $asset->site?->name,
                    $asset->status,
                    $asset->quantity,
                    $asset->purchase_year,
                    $asset->vendor?->name,
                ]);
            }

            fclose($file);
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
}