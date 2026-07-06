<?php

namespace App\Http\Controllers;

use App\Models\TableConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TableConfigurationController extends Controller
{
    /**
     * Display a listing of table configurations for a specific table.
     */
    public function index(Request $request, $tableName = 'assets')
    {
        $configurations = TableConfiguration::forTable($tableName)
            ->ordered()
            ->get();

        $tables = TableConfiguration::select('table_name')
            ->distinct()
            ->pluck('table_name');

        return inertia('MasterData/TableConfigurations/Index', [
            'configurations' => $configurations,
            'currentTable' => $tableName,
            'tables' => $tables,
        ]);
    }

    /**
     * Show the form for creating a new table configuration.
     */
    public function create(Request $request, $tableName = 'assets')
    {
        $siteId = $request->query('site_id');

        return inertia('MasterData/TableConfigurations/Create', [
            'currentTable' => $tableName,
            'sites' => \App\Models\Site::select('id', 'name')->get(),
            'currentSiteId' => $siteId ? (int) $siteId : null,
        ]);
    }

    /**
     * Store a newly created table configuration.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:255',
            'column_key' => 'required|string|max:255',
            'column_title' => 'required|string|max:255',
            'data_type' => 'required|string|in:string,number,date,boolean,enum,array',
            'data_source' => 'nullable|string|max:255',
            'site_id' => 'nullable|integer|exists:sites,id',
            'is_primary_key' => 'boolean',
            'is_sortable' => 'boolean',
            'is_filterable' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer|min:0',
            'width' => 'nullable|integer|min:50|max:500',
            'alignment' => 'required|string|in:left,center,right',
            'format_pattern' => 'nullable|string|max:255',
            'options' => 'nullable|array',
        ]);

        // Check if column_key already exists for this table + site (include soft-deleted rows)
        $existing = TableConfiguration::withTrashed()
            ->where('table_name', $validated['table_name'])
            ->where('column_key', $validated['column_key'])
            ->where('site_id', $validated['site_id'] ?? null)
            ->first();

        if ($existing) {
            if ($existing->trashed()) {
                // Restore soft-deleted row and update it with new values
                $existing->restore();
                $existing->update(array_merge($validated, [
                    'created_by' => Auth::id(),
                    'updated_by' => Auth::id(),
                ]));
                return redirect()->route('table-configurations.index', [
                    'tableName' => $validated['table_name']
                ])->with('success', 'Column configuration restored and updated successfully.');
            }

            return back()->withErrors([
                'column_key' => 'This column key already exists for this table.'
            ])->withInput();
        }

        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();

        TableConfiguration::create($validated);

        return redirect()->route('table-configurations.index', [
            'tableName' => $validated['table_name']
        ])->with('success', 'Column configuration created successfully.');
    }

    /**
     * Auto-generate column configs from CSV headers and set primary key.
     */
    public function generateFromHeaders(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:255',
            'headers' => 'required|array|min:1',
            'headers.*' => 'required|string|max:255',
            'primary_key_header' => 'nullable|string|max:255',
            'site_id' => 'nullable|integer|exists:sites,id',
        ]);

        $created = [];
        $sortOrder = 0;

        foreach ($validated['headers'] as $header) {
            $clean = trim($header);
            $key = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', $clean));
            $key = trim($key, '_');

            // Deduplicate keys within the same scope (table_name + site_id)
            $existingQuery = TableConfiguration::where('table_name', $validated['table_name'])
                ->where('column_key', $key);
            if (!empty($validated['site_id'])) {
                $existingQuery->where('site_id', $validated['site_id']);
            } else {
                $existingQuery->whereNull('site_id');
            }

            $originalKey = $key;
            $suffix = 1;
            while ($existingQuery->exists()) {
                $key = $originalKey . '_' . $suffix++;
            }

            $isPk = $validated['primary_key_header'] && strcasecmp(trim($validated['primary_key_header']), $clean) === 0;

            $config = TableConfiguration::create([
                'table_name' => $validated['table_name'],
                'site_id' => $validated['site_id'] ?? null,
                'column_key' => $key,
                'column_title' => $clean,
                'data_type' => 'string',
                'is_primary_key' => $isPk,
                'is_sortable' => true,
                'is_filterable' => true,
                'is_visible' => true,
                'sort_order' => $sortOrder++,
                'alignment' => 'left',
            ]);

            $created[] = $config;
        }

        return response()->json([
            'configurations' => $created,
            'message' => count($created) . ' columns created from CSV.',
        ]);
    }

    /**
     * Display the specified table configuration.
     */
    public function show(TableConfiguration $tableConfiguration)
    {
        return inertia('MasterData/TableConfigurations/Show', [
            'configuration' => $tableConfiguration,
        ]);
    }

    /**
     * Show the form for editing the specified table configuration.
     */
    public function edit(TableConfiguration $tableConfiguration)
    {
        return inertia('MasterData/TableConfigurations/Edit', [
            'configuration' => $tableConfiguration,
        ]);
    }

    /**
     * Update the specified table configuration.
     */
    public function update(Request $request, TableConfiguration $tableConfiguration)
    {
        $validated = $request->validate([
            'column_title' => 'sometimes|required|string|max:255',
            'data_type' => 'sometimes|required|string|in:string,number,date,boolean,enum,array',
            'data_source' => 'nullable|string|max:255',
            'site_id' => 'nullable|integer|exists:sites,id',
            'is_primary_key' => 'boolean',
            'is_sortable' => 'boolean',
            'is_filterable' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer|min:0',
            'width' => 'nullable|integer|min:50|max:500',
            'alignment' => 'sometimes|required|string|in:left,center,right',
            'format_pattern' => 'nullable|string|max:255',
            'options' => 'nullable|array',
        ]);

        $validated['updated_by'] = Auth::id();

        $tableConfiguration->update($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Column renamed successfully.',
                'configuration' => $tableConfiguration->fresh(),
            ]);
        }

        return redirect()->route('table-configurations.index', [
            'tableName' => $tableConfiguration->table_name
        ])->with('success', 'Column configuration updated successfully.');
    }

    /**
     * Remove the specified table configuration.
     */
    public function destroy($id)
    {
        $tableConfiguration = TableConfiguration::withTrashed()->findOrFail($id);
        $tableName = $tableConfiguration->table_name;
        $tableConfiguration->forceDelete();

        return redirect()->route('table-configurations.index', [
            'tableName' => $tableName
        ])->with('success', 'Column configuration deleted successfully.');
    }

    /**
     * Batch delete configurations.
     */
    public function batchDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:table_configurations,id',
        ]);

        $count = TableConfiguration::whereIn('id', $validated['ids'])->forceDelete();

        return redirect()->back()->with('success', "$count column configurations deleted successfully.");
    }

    /**
     * Batch update configurations (any fields).
     */
    public function batchUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:table_configurations,id',
            'updates' => 'required|array|min:1',
            'updates.*.field' => 'required|string|in:column_title,data_type,is_visible,is_sortable,is_filterable,is_primary_key,alignment,sort_order',
            'updates.*.value' => 'required',
        ]);

        $affected = 0;
        foreach ($validated['ids'] as $id) {
            $record = TableConfiguration::find($id);
            if (!$record) continue;
            $patch = [];
            foreach ($validated['updates'] as $u) {
                $patch[$u['field']] = $u['value'];
            }
            $patch['updated_by'] = Auth::id();
            $record->update($patch);
            $affected++;
        }

        return redirect()->back()->with('success', "$affected column configurations updated.");
    }

    /**
     * Bulk update sort order.
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'columns' => 'required|array',
            'columns.*.id' => 'required|exists:table_configurations,id',
            'columns.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['columns'] as $column) {
            TableConfiguration::where('id', $column['id'])
                ->update(['sort_order' => $column['sort_order'], 'updated_by' => Auth::id()]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Duplicate a configuration.
     */
    public function duplicate(TableConfiguration $tableConfiguration)
    {
        $newConfiguration = $tableConfiguration->replicate([
            'created_by',
            'created_at',
        ]);
        $newConfiguration->column_key = $tableConfiguration->column_key . '_copy';
        $newConfiguration->column_title = $tableConfiguration->column_title . ' (Copy)';
        $newConfiguration->sort_order = $tableConfiguration->sort_order + 1;
        $newConfiguration->created_by = Auth::id();
        $newConfiguration->updated_by = Auth::id();
        $newConfiguration->save();

        return redirect()->route('table-configurations.index', [
            'tableName' => $tableConfiguration->table_name
        ])->with('success', 'Column configuration duplicated successfully.');
    }

    /**
     * Reset table to default — now a no-op; columns are created from CSV import.
     */
    public function resetToDefault($tableName)
    {
        return redirect()->route('table-configurations.index', [
            'tableName' => $tableName
        ])->with('info', 'Default configurations are not predefined. Import a CSV to auto-generate columns.');
    }
}
