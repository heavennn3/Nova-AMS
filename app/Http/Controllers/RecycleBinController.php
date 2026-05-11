<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetType;

class RecycleBinController extends Controller
{
    private $models = [
        'users' => User::class,
        'vendors' => Vendor::class,
        'assets' => Asset::class,
        'asset_categories' => AssetCategory::class,
        'spareparts' => AssetType::class,
    ];

    public function index(Request $request)
    {
        $type = $request->query('type', 'users'); // default to users
        
        if (!array_key_exists($type, $this->models)) {
            $type = 'users';
        }

        $modelClass = $this->models[$type];
        
        // Fetch only trashed items
        $query = $modelClass::onlyTrashed();
        
        // If there's a search term
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            // A basic search on the primary identifying column
            if ($type === 'users') {
                $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            } elseif ($type === 'vendors') {
                $query->where('name', 'like', "%{$search}%");
            } elseif ($type === 'assets') {
                $query->where('asset_id', 'like', "%{$search}%")->orWhere('product_name', 'like', "%{$search}%");
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
                $data['name'] = $item->product_name ?? $item->asset_id;
                $data['details'] = 'Asset ID: ' . $item->asset_id;
            } else {
                $data['name'] = $item->name;
                $data['details'] = $item->description ?? 'No description';
            }
            
            return $data;
        })->values()->toArray();

        return Inertia::render('Security/RecycleBin', [
            'items' => $items,
            'filters' => [
                'type' => $type,
                'search' => $request->search ?? ''
            ]
        ]);
    }

    public function restore(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|string|in:users,vendors,assets,asset_categories,spareparts'
        ]);

        $modelClass = $this->models[$request->type];
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->restore();

        return redirect()->back()->with('success', 'Item restored successfully.');
    }

    public function forceDelete(Request $request, $id)
    {
        $request->validate([
            'type' => 'required|string|in:users,vendors,assets,asset_categories,spareparts'
        ]);

        $modelClass = $this->models[$request->type];
        $item = $modelClass::onlyTrashed()->findOrFail($id);
        $item->forceDelete();

        return redirect()->back()->with('success', 'Item permanently deleted.');
    }
}
