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
        $sites = \App\Models\Site::select('id', 'name')->get();

        return Inertia::render('Requests/Create', [
            'assetTypes' => $assetTypes,
            'assets' => $assets,
            'categories' => $categories,
            'licenses' => $licenses,
            'sites' => $sites,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->user()->hasRole('Admin')) {
            abort(403, 'Admins cannot create requests.');
        }

        $validated = $request->validate([
            'request_type' => 'required|string|in:Borrow,Checkout,Software License,Maintenance Request,Purchase Request,Loan',
            'priority' => 'required|string|in:Normal,High,Urgent',
            'asset_id' => 'nullable|exists:assets,id',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'license_id' => 'nullable|exists:licenses,id',
            'required_from' => 'nullable|date',
            'required_until' => 'nullable|date|after_or_equal:required_from',
            'reason' => 'required|string',
            // Loan-specific fields
            'loan_date' => 'nullable|date',
            'expected_return_date' => 'nullable|date|after_or_equal:loan_date',
            'condition_status' => 'nullable|in:good,semi_faulty,faulty',
            'purpose' => 'nullable|string|max:500',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['request_number'] = 'REQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $validated['status'] = 'Pending';

        // Handle loan-specific fields
        if ($validated['request_type'] === 'Loan') {
            $validated['loan_date'] = $validated['loan_date'] ?? now();
            $validated['purpose'] = $validated['purpose'] ?? $validated['reason'];
            $validated['condition_status'] = $validated['condition_status'] ?? 'good';
        }

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
        // Get all regular requests
        $requests = AssetRequest::with([
                'user.site',
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'category',
                'approver',
                'license',
            ])
            ->latest()
            ->get();

        // Get all loan requests and merge them
        $loanRequests = \App\Models\AssetLoan::with([
                'user.site',
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'site',
                'approver',
            ])
            ->latest()
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'type' => 'loan', // Mark as loan type
                    'request_number' => 'LOAN-' . $loan->id,
                    'user_id' => $loan->user_id,
                    'user' => $loan->user,
                    'asset_id' => $loan->asset_id,
                    'asset' => $loan->asset,
                    'request_type' => 'Loan',
                    'priority' => 'Normal',
                    'status' => ucfirst($loan->status),
                    'created_at' => $loan->created_at,
                    'required_from' => $loan->loan_date,
                    'required_until' => $loan->expected_return_date,
                    'reason' => $loan->purpose,
                    'admin_notes' => $loan->notes,
                    'approved_by' => $loan->approved_by,
                    'approved_at' => $loan->approved_at,
                    'loan_date' => $loan->loan_date,
                    'expected_return_date' => $loan->expected_return_date,
                    'condition_status' => $loan->condition_status,
                    'purpose' => $loan->purpose,
                    'original_model' => 'AssetLoan', // Track original model for actions
                ];
            });

        // Merge both collections
        $allRequests = collect($requests)->concat($loanRequests)->sortByDesc('created_at')->values();

        $sites = \App\Models\Site::select('id', 'name')->get();

        return Inertia::render('Requests/AdminIndex', [
            'requests' => $allRequests,
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
        // Check if this is a loan request
        $isLoanRequest = $request->input('is_loan_request') === 'true';

        if ($isLoanRequest) {
            // Handle AssetLoan approval
            $loan = \App\Models\AssetLoan::findOrFail($id);
            $loan->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            // Update asset status
            if ($loan->asset_id) {
                $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($loan->asset_id);
                if ($asset) {
                    $asset->setField('status', 'Used');
                }
            }

            return back()->with('success', 'Loan request approved.');
        }

        // Handle regular AssetRequest approval
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
        // Check if this is a loan request
        $isLoanRequest = $request->input('is_loan_request') === 'true';

        if ($isLoanRequest) {
            // Handle AssetLoan rejection
            $loan = \App\Models\AssetLoan::findOrFail($id);
            $loan->update([
                'status' => 'rejected',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            return back()->with('success', 'Loan request rejected.');
        }

        // Handle regular AssetRequest rejection
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

        // For Loan requests: create AssetLoan record
        if ($assetRequest->request_type === 'Loan' && $assetRequest->asset_id) {
            $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($assetRequest->asset_id);

            if ($asset) {
                \App\Models\AssetLoan::create([
                    'asset_id' => $assetRequest->asset_id,
                    'user_id' => $assetRequest->user_id,
                    'site_id' => $asset->site_id,
                    'loan_date' => $assetRequest->loan_date ?? now(),
                    'expected_return_date' => $assetRequest->expected_return_date ?? $assetRequest->required_until,
                    'condition_status' => $assetRequest->condition_status ?? 'good',
                    'purpose' => $assetRequest->purpose ?? $assetRequest->reason,
                    'notes' => $assetRequest->admin_notes,
                    'status' => 'approved',
                    'approved_by' => $assetRequest->approved_by,
                    'approved_at' => $assetRequest->approved_at,
                ]);

                $asset->setField('status', 'Used');
            }
        }

        return back()->with('success', 'Request fulfilled.');
    }

    public function markReturned(Request $request, $id)
    {
        // Check if this is a loan request
        $isLoanRequest = $request->input('is_loan_request') === 'true';

        if ($isLoanRequest) {
            // Handle AssetLoan return
            $loan = \App\Models\AssetLoan::where('status', 'approved')->findOrFail($id);
            $loan->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            // Update asset status back to available
            if ($loan->asset_id) {
                $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($loan->asset_id);
                if ($asset) {
                    $asset->setField('status', 'Available');
                }
            }

            return back()->with('success', 'Asset loan marked as returned.');
        }

        // Handle regular AssetRequest return
        $assetRequest = AssetRequest::where('status', 'Fulfilled')
            ->whereIn('request_type', ['Borrow', 'Checkout', 'Loan'])
            ->findOrFail($id);

        $assetRequest->update([
            'status' => 'Returned',
            'returned_at' => now(),
        ]);

        // Handle asset return based on request type
        if ($assetRequest->request_type === 'Loan' && $assetRequest->asset_id) {
            // Find and update the associated AssetLoan
            $assetLoan = \App\Models\AssetLoan::where('asset_id', $assetRequest->asset_id)
                ->where('user_id', $assetRequest->user_id)
                ->where('status', 'approved')
                ->latest()
                ->first();

            if ($assetLoan) {
                $assetLoan->update([
                    'status' => 'returned',
                    'returned_at' => now(),
                ]);
            }

            // Update asset status back to available
            $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($assetRequest->asset_id);
            if ($asset) {
                $asset->setField('status', 'Available');
            }
        } elseif (in_array($assetRequest->request_type, ['Borrow', 'Checkout']) && $assetRequest->asset_id) {
            // Handle Borrow/Checkout returns
            $asset = \App\Models\Asset::withoutGlobalScope('site_access')->find($assetRequest->asset_id);
            if ($asset) {
                $asset->update(['status' => 'available']);
            }
        }

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
