<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\AssetStatus;
use Illuminate\Http\Request;

class AssetStatusController extends Controller
{
    public function index()
    {
        return response()->json(AssetStatus::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:asset_statuses,name',
            'color' => 'required|string|max:50',
            'sort_order' => 'nullable|integer',
        ]);
        $status = AssetStatus::create($validated);
        return redirect()->back()->with('success', 'Status created.');
    }

    public function update(Request $request, AssetStatus $assetStatus)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:asset_statuses,name,' . $assetStatus->id,
            'color' => 'required|string|max:50',
            'sort_order' => 'nullable|integer',
        ]);
        $assetStatus->update($validated);
        return redirect()->back()->with('success', 'Status updated.');
    }

    public function destroy(AssetStatus $assetStatus)
    {
        $assetStatus->delete();
        return redirect()->back()->with('success', 'Status deleted.');
    }
}
