<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreVendorRequest;
use App\Http\Requests\MasterData\UpdateVendorRequest;
use App\Models\Vendor;
use App\Models\Asset;

class VendorController extends Controller
{
    public function index()
    {
        return response()->json(Vendor::get());
    }

    public function store(StoreVendorRequest $request)
    {
        Vendor::create($request->validated());
        return back()->with('success', 'Vendor created.');
    }

    public function update(UpdateVendorRequest $request, $id)
    {
        Vendor::findOrFail($id)->update($request->validated());
        return back()->with('success', 'Vendor updated.');
    }

    public function destroy($id)
    {
        Vendor::findOrFail($id)->delete();
        return back()->with('success', 'Vendor deleted.');
    }
}
