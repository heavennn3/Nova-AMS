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

        // Only show current user's loans
        $loans = AssetLoan::with(['asset.fieldValues', 'site', 'approver'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($loan) {
                $assetName = 'Unknown';
                $assetId = 'N/A';
                
                if ($loan->asset) {
                    $fields = $loan->asset->getFields();
                    $assetName = $fields['jenis_aset']
                        ?? $fields['aset_id']
                        ?? 'Unknown';
                    $assetId = $fields['aset_id']
                        ?? $fields['serial_number']
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
                    'site_id' => $asset->site_id,
                    'fields' => $fields,
                ];
            });

        $sites = Site::select('id', 'name')->get();

        // Collect all unique column keys across assets for the table header
        $allKeys = $assets->reduce(function ($carry, $asset) {
            return array_unique(array_merge($carry, array_keys($asset['fields'])));
        }, []);

        return Inertia::render('AssetLoans/Create', [
            'assets' => $assets,
            'sites' => $sites,
            'isAdmin' => $isAdmin,
            'userSiteId' => $userSiteId,
            'columns' => $allKeys,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'exists:assets,id',
            'site_id' => 'required|exists:sites,id',
            'loan_date' => 'nullable|date',
            'expected_return_date' => 'required|date|after_or_equal:loan_date',
            'condition_status' => 'nullable|in:good,semi_faulty,faulty',
            'purpose' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();

        foreach ($validated['asset_ids'] as $assetId) {
            AssetLoan::create([
                'asset_id' => $assetId,
                'user_id' => $user->id,
                'site_id' => $validated['site_id'],
                'loan_date' => $validated['loan_date'] ?? now()->format('Y-m-d'),
                'expected_return_date' => $validated['expected_return_date'],
                'condition_status' => $validated['condition_status'] ?? 'good',
                'purpose' => $validated['purpose'],
                'notes' => $validated['notes'] ?? '',
                'status' => 'pending',
            ]);
        }

        return redirect()->route('asset-loans.index')
            ->with('success', count($validated['asset_ids']) . ' asset loan request(s) submitted and pending approval.');
    }
}
