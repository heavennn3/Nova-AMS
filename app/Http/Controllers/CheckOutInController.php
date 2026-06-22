<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckOutInController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // User's current & past assignments
        $assignments = AssetAssignment::with([
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'site',
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('CheckOutIn/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function create(Request $request)
    {
        if ($request->user()->hasRole('Admin')) {
            abort(403, 'Admins cannot perform self-checkout.');
        }

        $categories = \App\Models\AssetCategory::select('id', 'name')->get();
        $assetTypes = AssetType::select('id', 'name')->get();
        $assets = Asset::withoutGlobalScope('site_access')
            ->select('id', 'asset_id', 'product_name', 'type_id', 'category_id', 'status', 'brand', 'serial_number', 'site_id')
            ->with(['site:id,name'])
            ->where('status', 'Available')
            ->get();

        $user = $request->user();

        return Inertia::render('CheckOutIn/Checkout', [
            'categories' => $categories,
            'assetTypes' => $assetTypes,
            'assets' => $assets,
            'currentUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->hasRole('Admin')) {
            abort(403, 'Admins cannot perform self-checkout.');
        }

        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'reason' => 'required|string|max:500',
            'expected_return' => 'nullable|date|after:today',
        ]);

        $asset = Asset::withoutGlobalScope('site_access')->findOrFail($validated['asset_id']);

        if ($asset->status !== 'Available') {
            return back()->withErrors(['asset_id' => 'This asset is no longer available.']);
        }

        // Create assignment
        AssetAssignment::create([
            'asset_id' => $asset->id,
            'user_id' => $request->user()->id,
            'site_id' => $asset->site_id,
            'assigned_at' => now(),
            'status' => 'active',
            'remarks' => $validated['reason'] . ($validated['expected_return'] ? ' | Expected return: ' . $validated['expected_return'] : ''),
        ]);

        // Mark asset as in_use
        $asset->update(['status' => 'in_use']);

        // Also create a request record for tracking
        \App\Models\AssetRequest::create([
            'request_number' => 'CO-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'user_id' => $request->user()->id,
            'asset_id' => $asset->id,
            'request_type' => 'Checkout',
            'priority' => 'Normal',
            'status' => 'Fulfilled',
            'reason' => $validated['reason'],
            'required_from' => now(),
            'required_until' => $validated['expected_return'] ?? null,
            'approved_at' => now(),
            'fulfilled_at' => now(),
        ]);

        return redirect()->route('checkout.index')->with('success', 'Asset checked out successfully.');
    }

    public function checkin(Request $request, $assignmentId)
    {
        $assignment = AssetAssignment::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->findOrFail($assignmentId);

        $assignment->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        // Mark asset available again
        if ($assignment->asset_id) {
            Asset::withoutGlobalScope('site_access')
                ->where('id', $assignment->asset_id)
                ->update(['status' => 'Available']);
        }

        return back()->with('success', 'Asset checked in successfully.');
    }
}
