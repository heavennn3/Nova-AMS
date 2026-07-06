<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreColumnRequest;
use App\Http\Requests\MasterData\UpdateColumnRequest;
use App\Models\CustomMasterDataColumn;
use Illuminate\Support\Str;

class ColumnController extends Controller
{
    public function store(StoreColumnRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name'], '_');
        $data['is_required'] = $request->boolean('is_required', false);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        CustomMasterDataColumn::create($data);
        return back()->with('success', 'Column added.');
    }

    public function update(UpdateColumnRequest $request, $id)
    {
        $column = CustomMasterDataColumn::findOrFail($id);
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name'], '_');
        $data['is_required'] = $request->boolean('is_required', false);
        $column->update($data);
        return back()->with('success', 'Column updated.');
    }

    public function destroy($id)
    {
        CustomMasterDataColumn::findOrFail($id)->delete();
        return back()->with('success', 'Column deleted.');
    }
}
