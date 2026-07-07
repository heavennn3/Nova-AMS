<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\TableConfiguration;
use Illuminate\Http\Request;

class SparePartController extends Controller
{
    public function store(Request $request)
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');

        $rules = [
            'spare_part_id' => 'nullable|string|max:255|unique:spare_parts,spare_part_id',
            'name' => 'required|string|max:255',
            'part_number' => 'nullable|string|unique:spare_parts,part_number',
            'spare_part_category_id' => 'nullable|exists:spare_part_categories,id',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'site_id' => 'nullable|exists:sites,id',
            'asset_type_id' => 'nullable|exists:asset_types,id',
            'status' => 'required|string|max:255',
        ];
        foreach ($configs as $c) {
            if (!in_array($c->column_key, array_keys($rules))) {
                $rules[$c->column_key] = 'nullable|string';
            }
        }

        $validated = $request->validate($rules);

        $dynamicFields = [];
        foreach ($configs as $c) {
            if (array_key_exists($c->column_key, $validated)) {
                $dynamicFields[$c->column_key] = $validated[$c->column_key];
                unset($validated[$c->column_key]);
            }
        }

        $sparePart = SparePart::create($validated);
        if (!empty($dynamicFields)) {
            $sparePart->syncFields($dynamicFields);
        }

        return redirect()->back()->with('success', 'Spare part created.');
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');

        $rules = [
            'spare_part_id' => 'nullable|string|max:255|unique:spare_parts,spare_part_id,' . $sparePart->id,
            'name' => 'required|string|max:255',
            'part_number' => 'nullable|string|unique:spare_parts,part_number,' . $sparePart->id,
            'spare_part_category_id' => 'nullable|exists:spare_part_categories,id',
            'category' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'site_id' => 'nullable|exists:sites,id',
            'asset_type_id' => 'nullable|exists:asset_types,id',
            'status' => 'required|string|max:255',
        ];
        foreach ($configs as $c) {
            if (!in_array($c->column_key, array_keys($rules))) {
                $rules[$c->column_key] = 'nullable|string';
            }
        }

        $validated = $request->validate($rules);

        $dynamicFields = [];
        foreach ($configs as $c) {
            if (array_key_exists($c->column_key, $validated)) {
                $dynamicFields[$c->column_key] = $validated[$c->column_key];
                unset($validated[$c->column_key]);
            }
        }

        $sparePart->update($validated);
        $sparePart->syncFields($dynamicFields);

        return redirect()->back()->with('success', 'Spare part updated.');
    }

    public function destroy(SparePart $sparePart)
    {
        $sparePart->delete();
        return redirect()->back()->with('success', 'Spare part deleted.');
    }
}
