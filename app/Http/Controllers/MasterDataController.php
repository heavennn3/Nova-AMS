<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Site;
use App\Models\Vendor;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('master-data', [
            'categories' => AssetCategory::all(),
            'types' => AssetType::with('category')->get(),
            'sites' => Site::all(),
            'vendors' => Vendor::all()
        ]);
    }

    // Categories
    public function storeCategory(Request $request)
    {
        AssetCategory::create($request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string']));
        return back()->with('success', 'Category created.');
    }
    public function updateCategory(Request $request, $id)
    {
        AssetCategory::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string']));
        return back()->with('success', 'Category updated.');
    }
    public function destroyCategory($id)
    {
        AssetCategory::findOrFail($id)->delete();
        return back()->with('success', 'Category deleted.');
    }

    // Types
    public function storeType(Request $request)
    {
        AssetType::create($request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string', 'asset_category_id' => 'required|exists:asset_categories,id']));
        return back()->with('success', 'Type created.');
    }
    public function updateType(Request $request, $id)
    {
        AssetType::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'description' => 'nullable|string', 'asset_category_id' => 'required|exists:asset_categories,id']));
        return back()->with('success', 'Type updated.');
    }
    public function destroyType($id)
    {
        AssetType::findOrFail($id)->delete();
        return back()->with('success', 'Type deleted.');
    }

    // Sites
    public function storeSite(Request $request)
    {
        Site::create($request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:255', 'region' => 'nullable|string|max:255']));
        return back()->with('success', 'Site created.');
    }
    public function updateSite(Request $request, $id)
    {
        Site::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:255', 'region' => 'nullable|string|max:255']));
        return back()->with('success', 'Site updated.');
    }
    public function destroySite($id)
    {
        Site::findOrFail($id)->delete();
        return back()->with('success', 'Site deleted.');
    }

    // Vendors
    public function storeVendor(Request $request)
    {
        Vendor::create($request->validate(['name' => 'required|string|max:255', 'contact_person' => 'nullable|string|max:255', 'email' => 'nullable|email|max:255', 'phone' => 'nullable|string|max:255', 'address' => 'nullable|string']));
        return back()->with('success', 'Vendor created.');
    }
    public function updateVendor(Request $request, $id)
    {
        Vendor::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'contact_person' => 'nullable|string|max:255', 'email' => 'nullable|email|max:255', 'phone' => 'nullable|string|max:255', 'address' => 'nullable|string']));
        return back()->with('success', 'Vendor updated.');
    }
    public function destroyVendor($id)
    {
        Vendor::findOrFail($id)->delete();
        return back()->with('success', 'Vendor deleted.');
    }
}
