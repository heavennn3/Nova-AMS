<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionApiController extends Controller
{
    public function index()
    {
        return response()->json(Region::with('sites')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:regions,name']);
        return response()->json(Region::create($validated), 201);
    }

    public function show(Region $region)
    {
        $region->load('sites');
        return response()->json($region);
    }

    public function update(Request $request, Region $region)
    {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:regions,name,' . $region->id]);
        $region->update($validated);
        return response()->json($region);
    }

    public function destroy(Region $region)
    {
        if ($region->sites()->exists()) {
            return response()->json(['message' => 'Cannot delete region with sites assigned.'], 409);
        }
        $region->delete();
        return response()->json(['message' => 'Region deleted']);
    }
}
