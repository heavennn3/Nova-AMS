<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetLoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = AssetLoan::with(['asset', 'user', 'site', 'approver']);

        // Admin sees all; non-admin sees only own
        if (!$user->hasRole('Admin')) {
            $query->where('user_id', $user->id);
        }

        $loans = $query->latest()->get();

        return Inertia::render('AssetLoans/Index', [
            'loans' => $loans,
        ]);
    }

    public function create(Request $request)
    {
        $assets = Asset::with(['site:id,name', 'fieldValues'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($asset) {
                $fields = $asset->getFields();
                return [
                    'id' => $asset->id,
                    'site_id' => (string) $asset->site_id,
                    'asset_id' => $fields['asset_id'] ?? $fields['aset_id'] ?? null,
                    'product_name' => $fields['product_name'] ?? null,
                    'brand' => $fields['brand'] ?? null,
                    'serial_number' => $fields['serial_number'] ?? null,
                    'category_id' => $fields['category_id'] ?? null,
                    'type_id' => $fields['type_id'] ?? null,
                    'status' => $fields['status'] ?? 'NOT UPDATED',
                    'site' => $asset->site ? ['id' => $asset->site->id, 'name' => $asset->site->name] : null,
                ];
            })
            ->values();

        $sites = Site::select('id', 'name')->get();
        $user = $request->user();

        return Inertia::render('AssetLoans/Create', [
            'assets' => $assets,
            'sites' => $sites,
            'currentUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'exists:assets,id',
            'site_id' => 'nullable|exists:sites,id',
            'loan_date' => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:loan_date',
            'condition_status' => 'required|in:good,semi_faulty,faulty',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $count = 0;
        foreach ($validated['asset_ids'] as $assetId) {
            AssetLoan::create([
                'asset_id' => $assetId,
                'user_id' => $request->user()->id,
                'site_id' => $validated['site_id'] ?? null,
                'loan_date' => $validated['loan_date'],
                'expected_return_date' => $validated['expected_return_date'] ?? null,
                'condition_status' => $validated['condition_status'],
                'purpose' => $validated['purpose'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]);
            $count++;
        }

        return redirect()->route('asset-loans.index')
            ->with('success', "{$count} loan request(s) submitted. Awaiting approval.");
    }

    public function approve(Request $request, AssetLoan $loan)
    {
        $loan->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        Asset::withoutGlobalScope('site_access')
            ->find($loan->asset_id)?->setField('status', 'Used');

        return back()->with('success', 'Loan approved.');
    }

    public function reject(Request $request, AssetLoan $loan)
    {
        $loan->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Loan rejected.');
    }

    public function returnAsset(Request $request, AssetLoan $loan)
    {
        $loan->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        Asset::withoutGlobalScope('site_access')
            ->find($loan->asset_id)?->setField('status', 'Available');

        return back()->with('success', 'Asset returned.');
    }
}
