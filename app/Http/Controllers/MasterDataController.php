<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\License;
use App\Models\LicenseSeat;
use App\Models\CustomMasterDataType;
use App\Models\CustomMasterDataValue;
use App\Models\CustomMasterDataColumn;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterDataController extends Controller
{
    public function index(Request $request)
    {
        $tableName = $request->query('tableName', 'assets');

        return Inertia::render('master-data', [
            'categories' => AssetCategory::all(),
            'types' => AssetType::with('category')->get(),
            'sites' => Site::all(),
            'vendors' => Vendor::get()->map(function ($vendor) {
                $assetsCount = Asset::count();
                return [
                    'id' => $vendor->id,
                    'name' => $vendor->name,
                    'contact_person' => $vendor->contact_person,
                    'phone' => $vendor->phone,
                    'email' => $vendor->email,
                    'address' => $vendor->address,
                    'logo' => $vendor->logo ? \Storage::url($vendor->logo) : null,
                    'assets_count' => $assetsCount,
                ];
            }),
            'customTypes' => CustomMasterDataType::with(['values', 'columns'])->get(),
            'licenses' => License::with(['vendor', 'site'])->get()->map(function ($license) {
                return [
                    'id' => $license->id,
                    'name' => $license->name,
                    'product_key' => $license->product_key,
                    'version' => $license->version,
                    'category' => $license->category,
                    'license_type' => $license->license_type,
                    'pricing_model' => $license->pricing_model,
                    'total_seats' => $license->total_seats,
                    'used_seats' => $license->used_seats,
                    'available_seats' => $license->available_seats,
                    'purchase_cost' => $license->purchase_cost,
                    'purchase_date' => $license->purchase_date ? $license->purchase_date->format('Y-m-d') : null,
                    'expiration_date' => $license->expiration_date ? $license->expiration_date->format('Y-m-d') : null,
                    'support_expiry' => $license->support_expiry ? $license->support_expiry->format('Y-m-d') : null,
                    'renewal_date' => $license->renewal_date ? $license->renewal_date->format('Y-m-d') : null,
                    'auto_renew' => $license->auto_renew,
                    'billing_cycle' => $license->billing_cycle,
                    'compliance_status' => $license->compliance_status,
                    'license_email' => $license->license_email,
                    'license_name' => $license->license_name,
                    'vendor' => $license->vendor ? $license->vendor->name : null,
                    'vendor_id' => $license->vendor_id,
                    'site' => $license->site ? $license->site->name : null,
                    'site_id' => $license->site_id,
                    'notes' => $license->notes,
                ];
            }),
            'tableConfigurations' => \App\Models\TableConfiguration::with('site')
                ->where('table_name', $tableName)
                ->orderBy('sort_order')
                ->get(),
            'configurationTables' => \App\Models\TableConfiguration::select('table_name')->distinct()->pluck('table_name'),
            'currentConfigTable' => $tableName,
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
        Site::create($request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:255', 'region' => 'nullable|string|in:sabah,sarawak']));
        return back()->with('success', 'Site created.');
    }
    public function updateSite(Request $request, $id)
    {
        Site::findOrFail($id)->update($request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:255', 'region' => 'nullable|string|in:sabah,sarawak']));
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

    // Software Licenses
    public function storeLicense(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'version' => 'nullable|string',
            'category' => 'nullable|string',
            'license_type' => 'required|in:per_user,per_device,concurrent,subscription,perpetual',
            'pricing_model' => 'required|in:one_time,annual,monthly,quarterly',
            'total_seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'support_expiry' => 'nullable|date',
            'renewal_date' => 'nullable|date',
            'auto_renew' => 'boolean',
            'billing_cycle' => 'nullable|in:monthly,quarterly,annual,custom',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $licenseData = array_merge($validated, [
                'used_seats' => 0,
                'available_seats' => $validated['total_seats'],
                'compliance_status' => 'compliant',
            ]);

            $license = License::create($licenseData);

            for ($i = 1; $i <= $validated['total_seats']; $i++) {
                LicenseSeat::create([
                    'license_id' => $license->id,
                    'seat_number' => $i,
                    'seat_status' => 'available',
                ]);
            }
        });

        return back()->with('success', 'License created.');
    }

    public function updateLicense(Request $request, $id)
    {
        $license = License::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'version' => 'nullable|string',
            'category' => 'nullable|string',
            'license_type' => 'required|in:per_user,per_device,concurrent,subscription,perpetual',
            'pricing_model' => 'required|in:one_time,annual,monthly,quarterly',
            'total_seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'support_expiry' => 'nullable|date',
            'renewal_date' => 'nullable|date',
            'auto_renew' => 'boolean',
            'billing_cycle' => 'nullable|in:monthly,quarterly,annual,custom',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($license, $validated) {
            $oldSeats = $license->licenseSeats()->count();
            $newSeats = (int)$validated['total_seats'];

            if ($newSeats > $oldSeats) {
                for ($i = $oldSeats + 1; $i <= $newSeats; $i++) {
                    LicenseSeat::create([
                        'license_id' => $license->id,
                        'seat_number' => $i,
                        'seat_status' => 'available',
                    ]);
                }
                $validated['available_seats'] = $license->available_seats + ($newSeats - $oldSeats);
            } elseif ($newSeats < $oldSeats) {
                $assigned = $license->licenseSeats()->where('seat_status', 'assigned')->count();
                if ($assigned > $newSeats) {
                    return;
                }
                $license->licenseSeats()
                    ->where('seat_status', 'available')
                    ->orderBy('seat_number', 'desc')
                    ->limit($oldSeats - $newSeats)
                    ->delete();
                $validated['available_seats'] = $newSeats - $assigned;
            }

            $license->update($validated);
        });

        return back()->with('success', 'License updated.');
    }

    public function destroyLicense($id)
    {
        $license = License::findOrFail($id);
        $assigned = $license->licenseSeats()->where('seat_status', 'assigned')->count();
        if ($assigned > 0) {
            return back()->with('error', "Cannot delete: {$assigned} seat(s) are currently assigned.");
        }
        $license->licenseSeats()->delete();
        $license->delete();
        return back()->with('success', 'License deleted.');
    }
}
