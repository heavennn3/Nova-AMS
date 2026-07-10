<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\Oem;
use App\Models\SparePart;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;

class RecycleBinApiController extends Controller
{
    public function bulkRestore(Request $request)
    {
        $type = $request->input('type');
        $ids = $request->input('ids', []);
        if (empty($ids)) return response()->json(['message' => 'No records selected'], 400);

        $count = 0;
        switch ($type) {
            case 'assets': $count = Asset::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'users': $count = User::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'vendors': $count = Vendor::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'categories': $count = AssetCategory::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'types': $count = AssetType::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'oems': $count = Oem::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            case 'spareparts': $count = SparePart::onlyTrashed()->whereIn('id', $ids)->restore(); break;
            default: return response()->json(['message' => "Unknown type: $type"], 400);
        }
        return response()->json(['message' => "Restored $count records", 'count' => $count]);
    }

    public function bulkForceDelete(Request $request)
    {
        $type = $request->input('type');
        $ids = $request->input('ids', []);
        if (empty($ids)) return response()->json(['message' => 'No records selected'], 400);

        $count = 0;
        switch ($type) {
            case 'assets': $count = Asset::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'users': $count = User::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'vendors': $count = Vendor::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'categories': $count = AssetCategory::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'types': $count = AssetType::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'oems': $count = Oem::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            case 'spareparts': $count = SparePart::onlyTrashed()->whereIn('id', $ids)->forceDelete(); break;
            default: return response()->json(['message' => "Unknown type: $type"], 400);
        }
        return response()->json(['message' => "Permanently deleted $count records", 'count' => $count]);
    }
}
