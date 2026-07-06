<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreValueRequest;
use App\Http\Requests\MasterData\UpdateValueRequest;
use App\Models\CustomMasterDataValue;
use Illuminate\Http\Request;

class ValueController extends Controller
{
    public function index()
    {
        return response()->json(CustomMasterDataValue::get());
    }

    public function store(StoreValueRequest $request)
    {
        CustomMasterDataValue::create($request->validated());
        return back()->with('success', 'Record added.');
    }

    public function update(UpdateValueRequest $request, $id)
    {
        CustomMasterDataValue::findOrFail($id)->update($request->validated());
        return back()->with('success', 'Record updated.');
    }

    public function destroy($id)
    {
        CustomMasterDataValue::findOrFail($id)->delete();
        return back()->with('success', 'Record deleted.');
    }

    public function batchDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:custom_master_data_values,id',
        ]);
        CustomMasterDataValue::whereIn('id', $validated['ids'])->delete();
        return back()->with('success', count($validated['ids']) . ' records deleted.');
    }

    public function batchUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:custom_master_data_values,id',
            'field' => 'required|string',
            'value' => 'nullable',
        ]);
        CustomMasterDataValue::whereIn('id', $validated['ids'])->get()->each(function ($val) use ($validated) {
            $data = $val->data ?? [];
            $data[$validated['field']] = $validated['value'];
            $val->data = $data;
            $val->save();
        });
        return back()->with('success', count($validated['ids']) . ' records updated.');
    }
}
