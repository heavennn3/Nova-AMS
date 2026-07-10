<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetTracking;

class TrackingApiController extends Controller
{
    public function poll()
    {
        return response()->json(
            AssetTracking::with('asset')->latest()->limit(50)->get()
        );
    }

    public function history()
    {
        return response()->json(
            AssetTracking::with('asset', 'user')
                ->latest()
                ->paginate(request()->query('per_page', 50))
        );
    }

    public function report()
    {
        return response()->json(
            AssetTracking::selectRaw('action, COUNT(*) as count, DATE(created_at) as date')
                ->groupBy('action', 'date')
                ->orderBy('date', 'desc')
                ->get()
        );
    }
}
