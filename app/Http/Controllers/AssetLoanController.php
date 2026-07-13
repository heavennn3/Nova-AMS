<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
                    $assetName = $fields['asset_name']
                        ?? $fields['jenis_aset']
                        ?? $fields['aset_id']
                        ?? 'Unknown';
                    $assetId = $fields['aset_id']
                        ?? $fields['asset_id']
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

        // Asset loans can only be requested for stored assets.
        // Keep legacy EAV status support because older imports may not have status_id.
        $assetsQuery = Asset::withoutGlobalScope('site_access')
            ->with(['fieldValues', 'status'])
            ->where(function ($query) {
                $query->whereHas('status', function ($status) {
                    $status->whereRaw('LOWER(TRIM(name)) = ?', ['stored']);
                })->orWhereHas('fieldValues', function ($field) {
                    $field->where('column_key', 'status')
                        ->whereRaw('LOWER(TRIM(value)) = ?', ['stored']);
                });
            })
            ->latest();

        if (!$isAdmin && $userSiteId) {
            $assetsQuery->where('site_id', $userSiteId);
        }

        $assets = $assetsQuery->get()
            ->map(function ($asset) {
                $fields = $asset->getFields();
                return [
                    'id' => $asset->id,
                    'site_id' => $asset->site_id,
                    'fields' => $fields,
                    'asset_name' => $fields['asset_name'] ?? null,
                    'asset_id' => $fields['asset_id'] ?? $fields['aset_id'] ?? null,
                    'serial_number' => $fields['serial_number'] ?? null,
                    'part_number' => $fields['part_number'] ?? null,
                    'location' => $fields['location'] ?? null,
                    'category_name' => $asset->category?->name,
                    'type_name' => $asset->type?->name,
                    'oem_name' => $asset->oem?->name,
                    'site_name' => $asset->site?->name,
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
        $created = $this->createLoanRequests($request);

        return redirect()->route('asset-loans.index')
            ->with('success', count($created) . ' asset loan request(s) submitted and pending approval.');
    }

    /**
     * Quick JSON API for creating loans from the inventory page.
     */
    public function quickStore(Request $request)
    {
        $created = $this->createLoanRequests($request, true);

        return $this->loanResponse($created);
    }

    /** Create a loan request through the public JSON API. */
    public function apiStore(Request $request)
    {
        $created = $this->createLoanRequests($request);

        return $this->loanResponse($created);
    }

    private function loanResponse($created)
    {
        return response()->json([
            'message' => count($created) . ' loan request(s) submitted and pending admin approval.',
            'count' => count($created),
            'loans' => $created->map(fn (AssetLoan $loan) => [
                'id' => $loan->id,
                'status' => $loan->status,
            ]),
        ], 201);
    }

    /**
     * Create pending requests only for assets the requester may borrow.
     * This method is shared by the Inertia form and JSON API to keep their
     * validation and availability rules identical.
     */
    private function createLoanRequests(Request $request, bool $useAccountSite = false)
    {
        $request->merge([
            'asset_ids' => $request->input('asset_ids', $request->filled('asset_id') ? [$request->input('asset_id')] : []),
            'loan_date' => $request->input('loan_date', now()->toDateString()),
        ]);

        $rules = [
            'asset_ids' => ['required', 'array', 'min:1'],
            'asset_ids.*' => ['required', 'integer', 'distinct', 'exists:assets,id'],
            'loan_date' => ['required', 'date', 'after_or_equal:today'],
            'expected_return_date' => ['required', 'date', 'after_or_equal:loan_date'],
            'condition_status' => ['nullable', 'in:good,semi_faulty,faulty'],
            'purpose' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        if (!$useAccountSite) {
            $rules['site_id'] = ['required', 'integer', 'exists:sites,id'];
        }

        $validated = $request->validate($rules);
        $user = $request->user();
        $siteId = $useAccountSite ? $user->site_id : (int) $validated['site_id'];

        if (!$siteId) {
            throw ValidationException::withMessages(['site_id' => 'Your account must be assigned to a site before requesting a loan.']);
        }

        if (!$user->hasRole('Admin') && (int) $user->site_id !== $siteId) {
            throw ValidationException::withMessages(['site_id' => 'You can only request loans from your assigned site.']);
        }

        return DB::transaction(function () use ($validated, $user, $siteId) {
            $assets = Asset::withoutGlobalScope('site_access')
                ->with('status')
                ->whereIn('id', $validated['asset_ids'])
                ->lockForUpdate()
                ->get();

            if ($assets->count() !== count($validated['asset_ids'])) {
                throw ValidationException::withMessages(['asset_ids' => 'One or more selected assets no longer exist.']);
            }

            $unavailable = $assets->filter(function (Asset $asset) use ($siteId) {
                $normalizedStored = strtolower(trim((string) $asset->status?->name)) === 'stored';
                $legacyStored = strtolower(trim((string) $asset->getField('status'))) === 'stored';

                return (int) $asset->site_id !== $siteId || (!$normalizedStored && !$legacyStored);
            });

            if ($unavailable->isNotEmpty()) {
                throw ValidationException::withMessages(['asset_ids' => 'Selected assets must be stored and belong to the selected site. Please refresh and try again.']);
            }

            $alreadyRequested = AssetLoan::whereIn('asset_id', $assets->pluck('id'))
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            if ($alreadyRequested) {
                throw ValidationException::withMessages(['asset_ids' => 'One or more selected assets already have a pending or active loan.']);
            }

            return $assets->map(fn (Asset $asset) => AssetLoan::create([
                'asset_id' => $asset->id,
                'user_id' => $user->id,
                'site_id' => $siteId,
                'loan_date' => $validated['loan_date'],
                'expected_return_date' => $validated['expected_return_date'],
                'condition_status' => $validated['condition_status'] ?? 'good',
                'purpose' => $validated['purpose'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
            ]));
        });
    }
}
