<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AssetRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetRequest::with(['user', 'asset', 'category'])
            ->where('user_id', $request->user()->id);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where('request_number', 'like', '%' . $request->search . '%');
        }

        $requests = $query->latest()->get();

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
        ]);
    }

    public function create()
    {
        $assets = Asset::withoutGlobalScope('site_access')->select('id', 'asset_id', 'product_name')->get();
        $categories = AssetCategory::select('id', 'name')->get();

        return Inertia::render('Requests/Create', [
            'assets' => $assets,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_type' => 'required|string',
            'priority' => 'required|string',
            'asset_id' => 'nullable|exists:assets,id',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'required_from' => 'nullable|date',
            'required_until' => 'nullable|date|after_or_equal:required_from',
            'reason' => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['request_number'] = 'REQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $validated['status'] = 'Pending';

        AssetRequest::create($validated);

        return redirect()->route('requests.index')->with('success', 'Request submitted successfully.');
    }
}
