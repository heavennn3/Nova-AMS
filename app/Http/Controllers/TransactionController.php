<?php

namespace App\Http\Controllers;

use App\Models\AssetAssignment;
use App\Models\AssetRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Asset requests (all types)
        $requests = AssetRequest::with([
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'category',
                'approver',
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'type' => 'request',
                'subtype' => $r->request_type,
                'title' => $this->getRequestTitle($r),
                'description' => $r->reason,
                'status' => $r->status,
                'reference' => $r->request_number,
                'date' => $r->created_at,
                'meta' => [
                    'asset_name' => $r->asset?->product_name,
                    'asset_id' => $r->asset?->asset_id,
                    'category' => $r->category?->name,
                    'priority' => $r->priority,
                    'approved_by' => $r->approver?->name,
                    'approved_at' => $r->approved_at,
                    'fulfilled_at' => $r->fulfilled_at,
                    'returned_at' => $r->returned_at,
                    'admin_notes' => $r->admin_notes,
                    'required_from' => $r->required_from,
                    'required_until' => $r->required_until,
                ],
            ]);

        // Asset assignments (checkout/return)
        $assignments = AssetAssignment::with([
                'asset' => fn($q) => $q->withoutGlobalScope('site_access'),
                'site',
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn($a) => [
                'id' => 'assign-' . $a->id,
                'type' => 'assignment',
                'subtype' => $a->status === 'active' ? 'Checked Out' : 'Returned',
                'title' => ($a->status === 'active' ? 'Checked out: ' : 'Returned: ') . ($a->asset?->product_name ?? 'Unknown Asset'),
                'description' => $a->remarks,
                'status' => $a->status === 'active' ? 'Active' : 'Returned',
                'reference' => $a->asset?->asset_id,
                'date' => $a->assigned_at ?? $a->created_at,
                'meta' => [
                    'asset_name' => $a->asset?->product_name,
                    'asset_id' => $a->asset?->asset_id,
                    'site' => $a->site?->name,
                    'assigned_at' => $a->assigned_at,
                    'returned_at' => $a->returned_at,
                ],
            ]);

        // Merge and sort by date
        $transactions = $requests->concat($assignments)
            ->sortByDesc('date')
            ->values();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
        ]);
    }

    private function getRequestTitle(AssetRequest $r): string
    {
        $target = $r->asset?->product_name ?? $r->category?->name ?? '';

        // Extract license name from reason
        if ($r->request_type === 'Software License' && preg_match('/\[License: (.+?)\]/', $r->reason, $m)) {
            $target = $m[1];
        }

        return match ($r->request_type) {
            'Borrow' => "Borrow request: $target",
            'Checkout' => "Checkout request: $target",
            'Software License' => "License request: $target",
            'Maintenance Request' => "Maintenance request: $target",
            'Purchase Request' => "Purchase request: $target",
            default => "Request: $target",
        };
    }
}
