<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\CustomMasterDataType;
use App\Models\CustomMasterDataValue;
use App\Models\CustomMasterDataColumn;
use Illuminate\Support\Str;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('master-data', [
            'categories' => AssetCategory::all(),
            'types' => AssetType::with('category')->get(),
            'sites' => Site::all(),
            'vendors' => Vendor::withCount('assets')->get()->map(function ($vendor) {
                return [
                    'id' => $vendor->id,
                    'name' => $vendor->name,
                    'contact_person' => $vendor->contact_person,
                    'phone' => $vendor->phone,
                    'email' => $vendor->email,
                    'address' => $vendor->address,
                    'logo' => $vendor->logo ? \Storage::url($vendor->logo) : null,
                    'assets_count' => $vendor->assets_count,
                ];
            }),
            'customTypes' => CustomMasterDataType::with(['values', 'columns'])->get(),
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
        AssetType::create($request->validate(['name' => 'required|string|max:255', 'category_id' => 'required|exists:asset_categories,id']));
        return back()->with('success', 'Type created.');
    }
    public function updateType(Request $request, $id)
    {
        AssetType::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'category_id' => 'required|exists:asset_categories,id']));
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

    // Custom Master Data Types
    public function storeCustomType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:custom_master_data_types,name',
            'description' => 'nullable|string',
        ]);
        
        $validated['slug'] = Str::slug($validated['name']);
        CustomMasterDataType::create($validated);
        
        return back()->with('success', 'Custom Master Data Type created.');
    }

    public function updateCustomType(Request $request, $id)
    {
        $type = CustomMasterDataType::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:custom_master_data_types,name,' . $id,
            'description' => 'nullable|string',
        ]);
        
        $validated['slug'] = Str::slug($validated['name']);
        $type->update($validated);
        
        return back()->with('success', 'Custom Master Data Type updated.');
    }

    public function destroyCustomType($id)
    {
        CustomMasterDataType::findOrFail($id)->delete();
        return back()->with('success', 'Custom Master Data Type deleted.');
    }

    // Custom Master Data Columns
    public function storeColumn(Request $request)
    {
        $validated = $request->validate([
            'custom_master_data_type_id' => 'required|exists:custom_master_data_types,id',
            'name' => 'required|string|max:255',
            'data_type' => 'required|in:text,number,date,boolean,select',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name'], '_');
        $validated['is_required'] = $request->boolean('is_required', false);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        CustomMasterDataColumn::create($validated);
        return back()->with('success', 'Column added.');
    }

    public function updateColumn(Request $request, $id)
    {
        $column = CustomMasterDataColumn::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'data_type' => 'required|in:text,number,date,boolean,select',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name'], '_');
        $validated['is_required'] = $request->boolean('is_required', false);

        $column->update($validated);
        return back()->with('success', 'Column updated.');
    }

    public function destroyColumn($id)
    {
        CustomMasterDataColumn::findOrFail($id)->delete();
        return back()->with('success', 'Column deleted.');
    }

    // Custom Master Data Values (JSON-based)
    public function storeCustomValue(Request $request)
    {
        $validated = $request->validate([
            'custom_master_data_type_id' => 'required|exists:custom_master_data_types,id',
            'data' => 'required|array',
        ]);

        CustomMasterDataValue::create($validated);
        return back()->with('success', 'Record added.');
    }

    public function updateCustomValue(Request $request, $id)
    {
        $value = CustomMasterDataValue::findOrFail($id);

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        $value->update($validated);
        return back()->with('success', 'Record updated.');
    }

    public function destroyCustomValue($id)
    {
        CustomMasterDataValue::findOrFail($id)->delete();
        return back()->with('success', 'Record deleted.');
    }

    // Batch Operations
    public function batchDeleteValues(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:custom_master_data_values,id',
        ]);

        CustomMasterDataValue::whereIn('id', $validated['ids'])->delete();
        return back()->with('success', count($validated['ids']) . ' records deleted.');
    }

    public function batchUpdateValues(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:custom_master_data_values,id',
            'field' => 'required|string',
            'value' => 'nullable',
        ]);

        $values = CustomMasterDataValue::whereIn('id', $validated['ids'])->get();
        foreach ($values as $val) {
            $data = $val->data ?? [];
            $data[$validated['field']] = $validated['value'];
            $val->data = $data;
            $val->save();
        }

        return back()->with('success', count($validated['ids']) . ' records updated.');
    }
}
