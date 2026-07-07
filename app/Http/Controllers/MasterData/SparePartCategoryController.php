<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\SparePartCategory;
use Illuminate\Http\Request;

class SparePartCategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'parent_id' => 'nullable|exists:spare_part_categories,id',
        ]);
        SparePartCategory::create($validated);
        return redirect()->back()->with('success', 'Spare part category created.');
    }

    public function update(Request $request, SparePartCategory $sparePartCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'parent_id' => 'nullable|exists:spare_part_categories,id',
        ]);
        $sparePartCategory->update($validated);
        return redirect()->back()->with('success', 'Spare part category updated.');
    }

    public function destroy(SparePartCategory $sparePartCategory)
    {
        $sparePartCategory->delete();
        return redirect()->back()->with('success', 'Spare part category deleted.');
    }
}
