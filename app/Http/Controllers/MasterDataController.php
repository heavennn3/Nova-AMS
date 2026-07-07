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
        $tableName = $request->query('tableName', 'assets');

        $allConfigs = TableConfiguration::with('site')
            ->where('table_name', $tableName)
            ->orderBy('sort_order')
            ->get();

        $tableConfigurations = $allConfigs->groupBy(function ($c) {
            return $c->site_id ?? 'global';
        })->toArray();

        $assetsCount = Asset::count();
        $isAdmin = $request->user()?->hasRole('Admin') ?? false;

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
            'tableConfigurations' => $tableConfigurations,
            'configurationTables' => TableConfiguration::select('table_name')->distinct()->pluck('table_name'),
            'currentConfigTable' => $tableName,
            'isAdmin' => $isAdmin,
            'assetStatuses' => \App\Models\AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color', 'sort_order']),
        ]);
    }
}
