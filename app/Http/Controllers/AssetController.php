<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        return Inertia::render('Assets/Index', [
            'assets' => Asset::with(['category','type','vendor','location'])->latest()->get()
        ]);
    }

    
    public function create()
    {
        return Inertia::render('Assets/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'asset_id' => 'required|unique:assets',
            'product_name' => 'required',
            'status' => 'required',
        ]);

        Asset::create($request->all());

        return redirect()->route('assets.index');
    }

    public function edit(Asset $asset)
    {
        return Inertia::render('Assets/Edit', [
            'asset' => $asset
        ]);
    }

    public function update(Request $request, Asset $asset)
    {
        $request->validate([
            'asset_id' => 'required|unique:assets,asset_id,' . $asset->id,
            'product_name' => 'required',
        ]);

        $asset->update($request->all());

        return redirect()->route('assets.index');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();

        return redirect()->back();
    }



public function dashboard()
{
    return Inertia::render('dashboard', [
        'totalAssets' => Asset::count(),
        'availableAssets' => Asset::where('status', 'available')->count(),
        'inUseAssets' => Asset::where('status', 'in_use')->count(),
        'underMaintenance' => Asset::where('status', 'under_maintenance')->count(),
        'faultyAssets' => Asset::where('status', 'faulty')->count(),
    ]);
}
}