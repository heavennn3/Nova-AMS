<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreSiteRequest;
use App\Http\Requests\MasterData\UpdateSiteRequest;
use App\Models\Site;

class SiteController extends Controller
{
    public function index()
    {
        return response()->json(Site::all());
    }

    public function store(StoreSiteRequest $request)
    {
        Site::create($request->validated());
        return back()->with('success', 'Site created.');
    }

    public function update(UpdateSiteRequest $request, $id)
    {
        Site::findOrFail($id)->update($request->validated());
        return back()->with('success', 'Site updated.');
    }

    public function destroy($id)
    {
        Site::findOrFail($id)->delete();
        return back()->with('success', 'Site deleted.');
    }
}
