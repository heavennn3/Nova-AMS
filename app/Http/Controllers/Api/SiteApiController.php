<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Models\Site;
use Illuminate\Http\Request;

class SiteApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Site::with('region');
        if ($regionId = $request->query('region_id')) {
            $query->where('region_id', $regionId);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sites,name',
            'code' => 'nullable|string|max:50',
            'region_id' => 'nullable|integer|exists:regions,id',
            'is_active' => 'boolean',
        ]);
        return response()->json(Site::create($validated), 201);
    }

    public function show(Site $site)
    {
        $site->load('region');
        return response()->json($site);
    }

    public function update(Request $request, Site $site)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sites,name,' . $site->id,
            'code' => 'nullable|string|max:50',
            'region_id' => 'nullable|integer|exists:regions,id',
            'is_active' => 'boolean',
        ]);
        $site->update($validated);
        return response()->json($site);
    }

    public function destroy(Site $site)
    {
        if ($site->assets()->exists()) {
            return response()->json(['message' => 'Cannot delete site with assets assigned.'], 409);
        }
        $site->delete();
        return response()->json(['message' => 'Site deleted']);
    }
}
