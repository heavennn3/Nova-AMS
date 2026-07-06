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
        $loans = AssetLoan::with(['asset', 'user', 'site', 'approver'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('AssetLoans/Index', [
            'loans' => $loans,
        ]);
    }

    public function create(Request $request)
    {
        $assets = Asset::with(['site:id,name', 'fieldValues'])
            ->where(function ($q) {
                $q->whereHas('fieldValues', fn($q) => $q->where('column_key', 'status')->where('value', 'Available'))
                  ->orWhereHas('fieldValues', fn($q) => $q->where('column_key', 'status')->where('value', 'NOT UPDATED'))
                  ->orWhereDoesntHave('fieldValues', fn($q) => $q->where('column_key', 'status'));
            })
            ->get()
            ->map(function ($asset) {
                $fields = $asset->getFields();
                return [
                    'id' => $asset->id,
                    'site_id' => $asset->site_id,
                    'asset_id' => $fields['asset_id'] ?? null,
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
            'asset_id' => 'required|exists:assets,id',
            'site_id' => 'nullable|exists:sites,id',
            'loan_date' => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:loan_date',
            'condition_status' => 'required|in:good,semi_faulty,faulty',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $loan = AssetLoan::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return redirect()->route('asset-loans.index')
            ->with('success', 'Loan request submitted. Awaiting approval.');
    }

    public function approve(Request $request, AssetLoan $loan)
    {
        $loan->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        Asset::withoutGlobalScope('site_access')
            ->find($loan->asset_id)?->setField('status', 'On Loan');

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
