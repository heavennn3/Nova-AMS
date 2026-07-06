<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreCategoryRequest;
use App\Http\Requests\MasterData\UpdateCategoryRequest;
use App\Models\AssetCategory;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(AssetCategory::all());
    }

    public function store(StoreCategoryRequest $request)
    {
        AssetCategory::create($request->validated());
        return back()->with('success', 'Category created.');
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        AssetCategory::findOrFail($id)->update($request->validated());
        return back()->with('success', 'Category updated.');
    }

    public function destroy($id)
    {
        AssetCategory::findOrFail($id)->delete();
        return back()->with('success', 'Category deleted.');
    }
}
