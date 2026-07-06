<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreCustomTypeRequest;
use App\Http\Requests\MasterData\UpdateCustomTypeRequest;
use App\Models\CustomMasterDataType;
use Illuminate\Support\Str;

class CustomTypeController extends Controller
{
    public function index()
    {
        return response()->json(CustomMasterDataType::with(['values', 'columns'])->get());
    }

    public function store(StoreCustomTypeRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        CustomMasterDataType::create($data);
        return back()->with('success', 'Custom Master Data Type created.');
    }

    public function update(UpdateCustomTypeRequest $request, $id)
    {
        $type = CustomMasterDataType::findOrFail($id);
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        $type->update($data);
        return back()->with('success', 'Custom Master Data Type updated.');
    }

    public function destroy($id)
    {
        CustomMasterDataType::findOrFail($id)->delete();
        return back()->with('success', 'Custom Master Data Type deleted.');
    }
}
