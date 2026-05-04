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



    public function routes()
    {
        return Inertia::render('Mapping/Routes', [
            'sites' => Site::all()
        ]);
    }
}
