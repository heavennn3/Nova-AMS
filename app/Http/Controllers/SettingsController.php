<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CustomField;
use App\Models\StatusLabel;
use App\Models\AssetModel;
use App\Models\AssetCategory;
use App\Models\Manufacturer;
use App\Models\Supplier;
use App\Models\Vendor;
use App\Models\Department;
use App\Models\Location;

class SettingsController extends Controller
{
    // Custom Fields
    public function customFields()
    {
        return Inertia::render('system-settings/custom-fields', [
            'data' => CustomField::all()
        ]);
    }
    public function storeCustomField(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'field_type' => 'required|string|in:text,number,date,boolean',
            'default_value' => 'nullable|string|max:255'
        ]);
        CustomField::create($validated);
        return back()->with('success', 'Custom Field created successfully.');
    }
    public function updateCustomField(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'field_type' => 'required|string|in:text,number,date,boolean',
            'default_value' => 'nullable|string|max:255'
        ]);
        CustomField::findOrFail($id)->update($validated);
        return back()->with('success', 'Custom Field updated successfully.');
    }
    public function destroyCustomField($id)
    {
        CustomField::findOrFail($id)->delete();
        return back()->with('success', 'Custom Field deleted successfully.');
    }

    // Status Labels
    public function statusLabels()
    {
        return Inertia::render('system-settings/status-labels', [
            'data' => StatusLabel::all()
        ]);
    }
    public function storeStatusLabel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:pending,deployable,archived,undeployable',
            'notes' => 'nullable|string'
        ]);
        StatusLabel::create($validated);
        return back()->with('success', 'Status Label created successfully.');
    }
    public function updateStatusLabel(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:pending,deployable,archived,undeployable',
            'notes' => 'nullable|string'
        ]);
        StatusLabel::findOrFail($id)->update($validated);
        return back()->with('success', 'Status Label updated successfully.');
    }
    public function destroyStatusLabel($id)
    {
        StatusLabel::findOrFail($id)->delete();
        return back()->with('success', 'Status Label deleted successfully.');
    }

    // Asset Models
    public function assetModels()
    {
        return Inertia::render('system-settings/asset-models', [
            'data' => AssetModel::with(['manufacturer', 'category'])->get(),
            'manufacturers' => Manufacturer::all(),
            'categories' => AssetCategory::all()
        ]);
    }
    public function storeAssetModel(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'model_number' => 'nullable|string|max:255',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'category_id' => 'nullable|exists:asset_categories,id'
        ]);
        AssetModel::create($validated);
        return back()->with('success', 'Asset Model created successfully.');
    }
    public function updateAssetModel(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'model_number' => 'nullable|string|max:255',
            'manufacturer_id' => 'nullable|exists:manufacturers,id',
            'category_id' => 'nullable|exists:asset_categories,id'
        ]);
        AssetModel::findOrFail($id)->update($validated);
        return back()->with('success', 'Asset Model updated successfully.');
    }
    public function destroyAssetModel($id)
    {
        AssetModel::findOrFail($id)->delete();
        return back()->with('success', 'Asset Model deleted successfully.');
    }

    // Categories
    public function categories()
    {
        return Inertia::render('system-settings/categories', [
            'data' => AssetCategory::all()
        ]);
    }
    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        AssetCategory::create($validated);
        return back()->with('success', 'Category created successfully.');
    }
    public function updateCategory(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);
        AssetCategory::findOrFail($id)->update($validated);
        return back()->with('success', 'Category updated successfully.');
    }
    public function destroyCategory($id)
    {
        AssetCategory::findOrFail($id)->delete();
        return back()->with('success', 'Category deleted successfully.');
    }

    // Manufacturers
    public function manufacturers()
    {
        return Inertia::render('system-settings/manufacturers', [
            'data' => Manufacturer::all()
        ]);
    }
    public function storeManufacturer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:255'
        ]);
        Manufacturer::create($validated);
        return back()->with('success', 'Manufacturer created successfully.');
    }
    public function updateManufacturer(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:255'
        ]);
        Manufacturer::findOrFail($id)->update($validated);
        return back()->with('success', 'Manufacturer updated successfully.');
    }
    public function destroyManufacturer($id)
    {
        Manufacturer::findOrFail($id)->delete();
        return back()->with('success', 'Manufacturer deleted successfully.');
    }

    // Suppliers & Vendors
    public function suppliers()
    {
        return Inertia::render('system-settings/suppliers', [
            'suppliers' => Supplier::all(),
            'vendors' => Vendor::all()
        ]);
    }
    public function storeSupplier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string'
        ]);
        Supplier::create($validated);
        return back()->with('success', 'Supplier created successfully.');
    }
    public function updateSupplier(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string'
        ]);
        Supplier::findOrFail($id)->update($validated);
        return back()->with('success', 'Supplier updated successfully.');
    }
    public function destroySupplier($id)
    {
        Supplier::findOrFail($id)->delete();
        return back()->with('success', 'Supplier deleted successfully.');
    }

    public function storeVendor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        Vendor::create($validated);
        return back()->with('success', 'Vendor created successfully.');
    }
    public function updateVendor(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        Vendor::findOrFail($id)->update($validated);
        return back()->with('success', 'Vendor updated successfully.');
    }
    public function destroyVendor($id)
    {
        Vendor::findOrFail($id)->delete();
        return back()->with('success', 'Vendor deleted successfully.');
    }

    // Departments
    public function departments()
    {
        return Inertia::render('system-settings/departments', [
            'data' => Department::all()
        ]);
    }
    public function storeDepartment(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:departments,code'
        ]);
        Department::create($validated);
        return back()->with('success', 'Department created successfully.');
    }
    public function updateDepartment(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:departments,code,' . $id
        ]);
        Department::findOrFail($id)->update($validated);
        return back()->with('success', 'Department updated successfully.');
    }
    public function destroyDepartment($id)
    {
        Department::findOrFail($id)->delete();
        return back()->with('success', 'Department deleted successfully.');
    }

    // Locations
    public function locations()
    {
        return Inertia::render('system-settings/locations', [
            'data' => Location::all()
        ]);
    }
    public function storeLocation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric'
        ]);
        Location::create($validated);
        return back()->with('success', 'Location created successfully.');
    }
    public function updateLocation(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric'
        ]);
        Location::findOrFail($id)->update($validated);
        return back()->with('success', 'Location updated successfully.');
    }
    public function destroyLocation($id)
    {
        Location::findOrFail($id)->delete();
        return back()->with('success', 'Location deleted successfully.');
    }
}
