<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        $assets = Asset::with(['category', 'type', 'vendor', 'location', 'site'])->latest()->get()->map(function ($asset) {
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
            'product_name' => 'required',
            'category_id' => 'nullable|exists:asset_categories,id',
            'type_id' => 'nullable|exists:asset_types,id',
            'site_id' => 'nullable|exists:sites,id',
            'quantity' => 'nullable|integer',
            'vendor_id' => 'nullable|exists:vendors,id',
            'purchase_year' => 'nullable|integer',
            'status' => 'required',
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
            'product_name' => 'required',
            'category_id' => 'nullable|exists:asset_categories,id',
            'type_id' => 'nullable|exists:asset_types,id',
            'site_id' => 'nullable|exists:sites,id',
            'quantity' => 'nullable|integer',
            'vendor_id' => 'nullable|exists:vendors,id',
            'purchase_year' => 'nullable|integer',
            'status' => 'required',
        ]);

        $asset->update($validated);

        return redirect()->route('assets.index')->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }



public function dashboard()
{
    return Inertia::render('dashboard', [
        'totalAssets' => Asset::count(),
        'availableAssets' => Asset::where('status', 'available')->count(),
        'inUseAssets' => Asset::where('status', 'in_use')->count(),
        'underMaintenance' => Asset::where('status', 'under_maintenance')->count(),
        'faultyAssets' => Asset::where('status', 'faulty')->count(),
    ]);
}
}