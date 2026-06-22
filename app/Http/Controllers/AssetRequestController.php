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

        $requests = AssetRequest::with([
                'user',
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'category',
                'approver',
                'license',
            ])
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

        $assetTypes = \App\Models\AssetType::select('id', 'name')->get();
        $assets = Asset::withoutGlobalScope('site_access')
            ->select('id', 'asset_id', 'product_name', 'type_id', 'status')
            ->where('status', 'Available')
            ->get();
        $categories = AssetCategory::select('id', 'name')->get();
        $licenses = License::select('id', 'name', 'category', 'available_seats')
            ->where('available_seats', '>', 0)
            ->get();

        return Inertia::render('Requests/Create', [
            'assetTypes' => $assetTypes,
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
            'license_id' => 'nullable|exists:licenses,id',
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
        $requests = AssetRequest::with([
                'user.site',
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'category',
                'approver',
                'license',
            ])
            ->latest()
            ->get();

        $sites = \App\Models\Site::select('id', 'name')->get();

        return Inertia::render('Requests/AdminIndex', [
            'requests' => $requests,
            'sites' => $sites,
        ]);
    }

    public function show($id)
    {
        $assetRequest = AssetRequest::with([
            'user',
            'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
            'category',
            'approver',
            'license',
        ])->findOrFail($id);

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

        // For Software License: assign seat + notify user with product key on approval
        if ($assetRequest->request_type === 'Software License' && $assetRequest->license_id) {
            $license = \App\Models\License::withoutGlobalScope('site_access')->find($assetRequest->license_id);
            $user = \App\Models\User::find($assetRequest->user_id);

            if ($license && $user && $license->available_seats > 0) {
                try {
                    $license->assignTo($user, 'user', $assetRequest->reason);

                    $user->notify(new \App\Notifications\LicenseFulfilledNotification(
                        $license->name,
                        $license->product_key,
                        $assetRequest->request_number,
                    ));
                } catch (\Exception $e) {
                    return back()->with('warning', 'Request approved but license seat assignment failed: ' . $e->getMessage());
                }
            }
        }

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

        // For Checkout / Borrow: create the actual assignment and mark asset in_use
        if (in_array($assetRequest->request_type, ['Checkout', 'Borrow']) && $assetRequest->asset_id) {
            $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($assetRequest->asset_id);

            if ($asset) {
                \App\Models\AssetAssignment::create([
                    'asset_id' => $asset->id,
                    'user_id' => $assetRequest->user_id,
                    'site_id' => $asset->site_id,
                    'assigned_at' => now(),
                    'status' => 'active',
                    'remarks' => $assetRequest->reason . ($assetRequest->required_until ? ' | Expected return: ' . $assetRequest->required_until->format('Y-m-d') : ''),
                ]);

                $asset->update(['status' => 'in_use']);
            }
        }

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

    public function batchApprove(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        $count = AssetRequest::whereIn('id', $request->ids)
            ->where('status', 'Pending')
            ->update([
                'status' => 'Approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_notes' => $request->input('admin_notes'),
            ]);

        return back()->with('success', "$count request(s) approved.");
    }

    public function batchReject(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'admin_notes' => 'required|string',
        ]);

        $count = AssetRequest::whereIn('id', $request->ids)
            ->where('status', 'Pending')
            ->update([
                'status' => 'Rejected',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_notes' => $request->input('admin_notes'),
            ]);

        return back()->with('success', "$count request(s) rejected.");
    }
}
