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
        $loans = AssetLoan::with(['asset', 'site', 'approver'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($loan) {
                return [
                    'id' => $loan->id,
                    'asset_id' => $loan->asset_id,
                    'asset_name' => $loan->asset ? $loan->asset->getFields()['product_name'] ?? 'Unknown' : 'Unknown',
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
        // Redirect to unified request page with loan type pre-selected
        return redirect()->route('requests.create')
            ->with('info', 'Loan requests are now managed through the unified request system. Please select "Loan" as the request type.');
    }

    public function store(Request $request)
    {
        // Redirect to unified request system
        return redirect()->route('requests.create')
            ->with('info', 'Loan requests are now managed through the unified request system. Please select "Loan" as the request type.');
    }
}
