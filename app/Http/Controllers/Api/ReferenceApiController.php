<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Oem;
use App\Models\Site;
use App\Models\Location;
use App\Models\AssetStatus;

class ReferenceApiController extends Controller
{
    public function categories()
    {
        return response()->json(AssetCategory::orderBy('name')->get(['id', 'name']));
    }

    public function types()
    {
        return response()->json(AssetType::orderBy('name')->get(['id', 'name']));
    }

    public function oems()
    {
        return response()->json(Oem::orderBy('name')->get(['id', 'name']));
    }

    public function sites()
    {
        return response()->json(Site::orderBy('name')->get(['id', 'name']));
    }

    public function locations()
    {
        return response()->json(Location::orderBy('name')->get(['id', 'name']));
    }

    public function assetStatuses()
    {
        return response()->json(AssetStatus::orderBy('sort_order')->get(['id', 'name', 'color']));
    }
}
