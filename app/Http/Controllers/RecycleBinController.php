<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetType;
use App\Models\TableConfiguration;

class RecycleBinController extends Controller
{
    private $models = [
        'users' => User::class,
        'vendors' => Vendor::class,
        'assets' => Asset::class,
        'asset_categories' => AssetCategory::class,
        'spareparts' => \App\Models\SparePart::class,
        'table_configurations' => TableConfiguration::class,
    ];

    private function validTypes(): string
    {
        return implode(',', array_keys($this->models));
    }

    public function index(Request $request)
    {
        $type = $request->query('type', 'users'); // default to users
        
        if (!array_key_exists($type, $this->models)) {
            $type = 'users';
        }

        $modelClass = $this->models[$type];
        
        // Fetch only trashed items
        $query = $modelClass::onlyTrashed();
        
        // Eager load for assets
        if ($type === 'assets') {
            $query->with(['fieldValues', 'site']);
        }
        
        // If there's a search term
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            // A basic search on the primary identifying column
            if ($type === 'users') {
                $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            } elseif ($type === 'vendors') {
                $query->where('name', 'like', "%{$search}%");
            } elseif ($type === 'assets') {
                $query->whereHas('fieldValues', function ($q) use ($search) {
                    $q->where('value', 'like', "%{$search}%");
                });
            } else {
                $query->where('name', 'like', "%{$search}%");
            }
        }
        
        $items = $query->get()->map(function ($item) use ($type) {
            $data = [
                'id' => $item->id,
                'deleted_at' => $item->deleted_at->toIso8601String(),
                'type' => $type
            ];
            
            if ($type === 'users') {
                $data['name'] = $item->name;
                $data['details'] = $item->email;
            } elseif ($type === 'vendors') {
                $data['name'] = $item->name;
                $data['details'] = $item->contact_email ?? 'No email';
            } elseif ($type === 'assets') {
                $fields = $item->getFields();
                $data['name'] = $fields['asset_id'] ?? $fields['aset_id'] ?? '#' . $item->id;
                $data['details'] = 'Site: ' . ($item->site->name ?? $item->site_id);
            } elseif ($type === 'table_configurations') {
                $data['name'] = $item->column_title ?? $item->column_key;
                $data['details'] = 'Table: ' . $item->table_name . ($item->site_id ? ' (Site #' . $item->site_id . ')' : ' (Global)');
            } else {
                $data['name'] = $item->name ?? $item->id;
                $data['details'] = $item->description ?? '';
            }
            
            return $data;
        })->values()->toArray();

        $stats = [];
        foreach ($this->models as $key => $modelClass) {
            $stats[$key] = $modelClass::onlyTrashed()->count();
        }

        return Inertia::render('Security/RecycleBin', [
            'items' => $items,
            'stats' => $stats,
            'filters' => [
                'type' => $type,
                'search' => $request->search ?? ''
            ]
        ]);
    }

    public function restore(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|string|in:' . implode(',', array_keys($this->models))
        ]);

        $modelClass = $this->models[$request->type];
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->restore();

        return redirect()->back()->with('success', 'Item restored successfully.');
    }

    public function forceDelete(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|string|in:' . implode(',', array_keys($this->models))
        ]);

        $modelClass = $this->models[$request->type];
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->forceDelete();

        return redirect()->back()->with('success', 'Item permanently deleted.');
    }
}
