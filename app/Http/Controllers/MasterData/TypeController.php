<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreTypeRequest;
use App\Http\Requests\MasterData\UpdateTypeRequest;
use App\Models\AssetType;

class TypeController extends Controller
{
    public function index()
    {
        return response()->json(AssetType::with('category')->get());
    }

    public function store(StoreTypeRequest $request)
    {
        AssetType::create($request->validated());
        return back()->with('success', 'Type created.');
    }

    public function update(UpdateTypeRequest $request, $id)
    {
        AssetType::findOrFail($id)->update($request->validated());
        return back()->with('success', 'Type updated.');
    }

    public function destroy($id)
    {
        AssetType::findOrFail($id)->delete();
        return back()->with('success', 'Type deleted.');
    }
}
