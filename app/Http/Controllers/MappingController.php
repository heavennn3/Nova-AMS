<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Site;

class MappingController extends Controller
{
    public function geographicView()
    {
        return Inertia::render('geographic-view', [
            'sites' => Site::withCount('assets')->get()
        ]);
    }

    public function floorPlans()
    {
        return Inertia::render('Mapping/FloorPlans', [
            'sites' => Site::all()
        ]);
    }

    public function updateSiteLocation(Request $request, Site $site)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if (!auth()->user()->hasRole('Admin')) {
            abort(403);
        }

        $site->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return back()->with('success', 'Site location updated successfully.');
    }




}
