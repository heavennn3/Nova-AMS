<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Site;
use App\Models\Asset;

class MultiSiteController extends Controller
{
    public function tracking()
    {
        return Inertia::render('MultiSite/Tracking', [
            'sites' => Site::all(),
            'assets' => Asset::with('site')->get()
        ]);
    }

    public function dashboards()
    {
        $stats = Site::withCount('assets')->get();
        
        return Inertia::render('MultiSite/Dashboards', [
            'sites' => $stats
        ]);
    }

    public function transfers()
    {
        // Mocking transfers data for now
        return Inertia::render('MultiSite/Transfers', [
            'sites' => Site::all(),
            'transfers' => []
        ]);
    }

    public function access()
    {
        return Inertia::render('MultiSite/Access', [
            'sites' => Site::all(),
            'users' => \App\Models\User::all()
        ]);
    }
}
