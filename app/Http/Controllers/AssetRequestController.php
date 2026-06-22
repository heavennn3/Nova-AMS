<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetRequest;
use App\Models\License;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AssetRequestController extends Controller
{
    // ──────────────────────────────
    //  Normal User endpoints
    // ──────────────────────────────

    public function index(Request $request)
    {
        // Admins should use the admin dashboard
        if ($request->user()->hasRole('Admin')) {
            return redirect()->route('requests.admin');
        }

        $requests = AssetRequest::with(['user', 'asset', 'category', 'approver'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
        ]);
    }

    public function create(Request $request)
    {
        if ($request->user()->hasRole('Admin')) {
            abort(403, 'Admins cannot create requests.');
        }

        $assets = Asset::withoutGlobalScope('site_access')->select('id', 'asset_id', 'product_name')->get();
        $categories = AssetCategory::select('id', 'name')->get();
        $licenses = License::select('id', 'name')->get();

        return Inertia::render('Requests/Create', [
            'assets' => $assets,
            'categories' => $categories,
            'licenses' => $licenses,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->hasRole('Admin')) {
            abort(403, 'Admins cannot create requests.');
        }

        $validated = $request->validate([
            'request_type' => 'required|string|in:Borrow,Checkout,Software License,Maintenance Request,Purchase Request',
            'priority' => 'required|string|in:Normal,High,Urgent',
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

    public function cancel(Request $request, $id)
    {
        $assetRequest = AssetRequest::where('user_id', $request->user()->id)
            ->where('status', 'Pending')
            ->findOrFail($id);

        $assetRequest->update(['status' => 'Cancelled']);

        return back()->with('success', 'Request cancelled.');
    }

    // ──────────────────────────────
    //  Admin endpoints
    // ──────────────────────────────

    public function adminIndex()
    {
        $requests = AssetRequest::with(['user', 'asset', 'category', 'approver'])
            ->latest()
            ->get();

        return Inertia::render('Requests/AdminIndex', [
            'requests' => $requests,
        ]);
    }

    public function show($id)
    {
        $assetRequest = AssetRequest::with(['user', 'asset', 'category', 'approver'])->findOrFail($id);

        return Inertia::render('Requests/Show', [
            'assetRequest' => $assetRequest,
        ]);
    }

    public function approve(Request $request, $id)
    {
        $assetRequest = AssetRequest::where('status', 'Pending')->findOrFail($id);

        $assetRequest->update([
            'status' => 'Approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return back()->with('success', 'Request approved.');
    }

    public function reject(Request $request, $id)
    {
        $assetRequest = AssetRequest::where('status', 'Pending')->findOrFail($id);

        $request->validate([
            'admin_notes' => 'required|string',
        ]);

        $assetRequest->update([
            'status' => 'Rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return back()->with('success', 'Request rejected.');
    }

    public function fulfill(Request $request, $id)
    {
        $assetRequest = AssetRequest::where('status', 'Approved')->findOrFail($id);

        $assetRequest->update([
            'status' => 'Fulfilled',
            'fulfilled_at' => now(),
            'admin_notes' => $request->input('admin_notes') ?: $assetRequest->admin_notes,
        ]);

        return back()->with('success', 'Request fulfilled.');
    }

    public function markReturned(Request $request, $id)
    {
        $assetRequest = AssetRequest::where('status', 'Fulfilled')
            ->whereIn('request_type', ['Borrow', 'Checkout'])
            ->findOrFail($id);

        $assetRequest->update([
            'status' => 'Returned',
            'returned_at' => now(),
        ]);

        return back()->with('success', 'Asset marked as returned.');
    }
}
