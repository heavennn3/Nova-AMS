<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\AssetType;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssetLoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Only show current user's loans
        $loans = AssetLoan::with(['asset.fieldValues', 'site', 'approver'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($loan) {
                $assetName = 'Unknown';
                $assetId = 'N/A';
                
                if ($loan->asset) {
                    $assetName = $loan->asset->getField('product_name') 
                        ?? $loan->asset->getField('asset_name') 
                        ?? 'Unknown';
                    $assetId = $loan->asset->getField('asset_id') 
                        ?? $loan->asset->getField('serial_number') 
                        ?? 'N/A';
                }

                return [
                    'id' => $loan->id,
                    'loan_id' => 'LOAN-' . str_pad($loan->id, 6, '0', STR_PAD_LEFT),
                    'asset_id' => $assetId,
                    'asset_name' => $assetName,
                    'loan_date' => $loan->loan_date?->format('Y-m-d'),
                    'expected_return_date' => $loan->expected_return_date?->format('Y-m-d'),
                    'condition_status' => $loan->condition_status,
                    'purpose' => $loan->purpose,
                    'status' => $loan->status,
                    'approved_at' => $loan->approved_at?->format('Y-m-d'),
                    'returned_at' => $loan->returned_at?->format('Y-m-d'),
                ];
            });

        return Inertia::render('AssetLoans/Index', [
            'loans' => $loans,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('Admin');
        $userSiteId = $user->site_id;

        $assetTypes = AssetType::select('id', 'name')->get();

        // Get assets with fieldValues, filter by site_id for non-admin
        $assetsQuery = Asset::withoutGlobalScope('site_access')
            ->with('fieldValues')
            ->latest();

        if (!$isAdmin && $userSiteId) {
            $assetsQuery->where('site_id', $userSiteId);
        }

        $assets = $assetsQuery->get()
            ->filter(function ($asset) {
                $fields = $asset->getFields();
                $status = $fields['status'] ?? '';
                return strtolower($status) === 'available';
            })
            ->values()
            ->map(function ($asset) {
                $fields = $asset->getFields();
                return [
                    'id' => $asset->id,
                    'label' => $fields['asset_id'] ?? $fields['product_name'] ?? $fields['asset_name'] ?? "Asset #{$asset->id}",
                    'site_id' => $asset->site_id,
                    'type_id' => $fields['type_id'] ?? null,
                ];
            });

        $sites = Site::select('id', 'name')->get();

        return Inertia::render('AssetLoans/Create', [
            'assetTypes' => $assetTypes,
            'assets' => $assets,
            'sites' => $sites,
            'isAdmin' => $isAdmin,
            'userSiteId' => $userSiteId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'site_id' => 'required|exists:sites,id',
            'loan_date' => 'nullable|date',
            'expected_return_date' => 'nullable|date|after_or_equal:loan_date',
            'condition_status' => 'nullable|in:good,semi_faulty,faulty',
            'purpose' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';
        $validated['loan_date'] = $validated['loan_date'] ?? now()->format('Y-m-d');
        $validated['condition_status'] = $validated['condition_status'] ?? 'good';

        AssetLoan::create($validated);

        return redirect()->route('asset-loans.index')
            ->with('success', 'Loan request submitted successfully.');
    }
}
