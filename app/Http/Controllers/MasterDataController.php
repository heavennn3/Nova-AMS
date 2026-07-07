<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Site;
use App\Models\Vendor;
use App\Models\License;
use App\Models\CustomMasterDataType;
use App\Models\CustomMasterDataValue;
use App\Models\CustomMasterDataColumn;
use App\Models\TableConfiguration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index(Request $request)
    {
        $isAdmin = $request->user()?->hasRole('Admin') ?? false;

        $assetTableConfigs = TableConfiguration::with('site')
            ->where('table_name', 'assets')
            ->orderBy('sort_order')
            ->get()
            ->groupBy(fn($c) => $c->site_id ?? 'global')
            ->toArray();

        $sparePartTableConfigs = TableConfiguration::with('site')
            ->where('table_name', 'spare_parts')
            ->orderBy('sort_order')
            ->get()
            ->groupBy(fn($c) => $c->site_id ?? 'global')
            ->toArray();

        $licenseTableConfigs = TableConfiguration::with('site')
            ->where('table_name', 'licenses')
            ->orderBy('sort_order')
            ->get()
            ->groupBy(fn($c) => $c->site_id ?? 'global')
            ->toArray();

        $assetsCount = Asset::count();

        return Inertia::render('master-data', [
            'categories' => AssetCategory::all(),
            'types' => AssetType::with('category')->get(),
            'sites' => Site::all(),
            'vendors' => Vendor::get()->map(fn($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'description' => $v->description,
                'assets_count' => $assetsCount,
            ]),
            'customTypes' => CustomMasterDataType::with(['values', 'columns'])->get(),
            'licenses' => License::with(['vendor', 'site'])->get()->map(fn($l) => [
                'id' => $l->id,
                'name' => $l->name,
                'product_key' => $l->product_key,
                'version' => $l->version,
                'category' => $l->category,
                'license_type' => $l->license_type,
                'pricing_model' => $l->pricing_model,
                'total_seats' => $l->total_seats,
                'used_seats' => $l->used_seats,
                'available_seats' => $l->available_seats,
                'purchase_cost' => $l->purchase_cost,
                'purchase_date' => $l->purchase_date?->format('Y-m-d'),
                'expiration_date' => $l->expiration_date?->format('Y-m-d'),
                'support_expiry' => $l->support_expiry?->format('Y-m-d'),
                'renewal_date' => $l->renewal_date?->format('Y-m-d'),
                'auto_renew' => $l->auto_renew,
                'billing_cycle' => $l->billing_cycle,
                'compliance_status' => $l->compliance_status,
                'license_email' => $l->license_email,
                'license_name' => $l->license_name,
                'vendor' => $l->vendor?->name,
                'vendor_id' => $l->vendor_id,
                'site' => $l->site?->name,
                'site_id' => $l->site_id,
                'notes' => $l->notes,
            ]),
            'spareParts' => \App\Models\SparePart::with(['site', 'assetType', 'category', 'fieldValues'])
                ->latest()
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'spare_part_id' => $p->spare_part_id,
                    'name' => $p->name,
                    'part_number' => $p->part_number,
                    'category' => $p->category,
                    'spare_part_category_id' => $p->spare_part_category_id,
                    'category_name' => $p->category?->name,
                    'quantity' => $p->quantity,
                    'minimum_stock_level' => $p->minimum_stock_level,
                    'unit_cost' => $p->unit_cost,
                    'location' => $p->location,
                    'site_id' => $p->site_id,
                    'site_name' => $p->site?->name,
                    'asset_type_id' => $p->asset_type_id,
                    'asset_type_name' => $p->assetType?->name,
                    'status' => $p->status,
                    'availability' => $p->availability,
                    'fields' => $p->getFields(),
                ]),
            'assetTableConfigs' => $assetTableConfigs,
            'sparePartTableConfigs' => $sparePartTableConfigs,
            'licenseTableConfigs' => $licenseTableConfigs,
            'isAdmin' => $isAdmin,
            'assetStatuses' => \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color', 'sort_order']),
            'sparePartCategories' => \App\Models\SparePartCategory::with('parent:id,name')->orderBy('name')->get()->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'parent_id' => $c->parent_id,
                'parent_name' => $c->parent?->name,
                'description' => $c->description,
            ]),
            'assetTypes' => \App\Models\AssetType::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
