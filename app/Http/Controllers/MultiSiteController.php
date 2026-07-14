<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Site;
use App\Models\Asset;

class MultiSiteController extends Controller
{
    public function tracking()
    {
        return Inertia::render('MultiSite/Tracking', [
            'sites' => Site::all(),
            'assets' => Asset::with('site')->get()
        ]);
    }

    public function dashboards()
    {
        $regions = \App\Models\Region::with('sites.users', 'sites.assets')
            ->orderBy('name')
            ->get()
            ->map(function ($region) {
                $sites = $region->sites->map(function ($site) {
                    $sparePartsCount = \App\Models\SparePart::where('site_id', $site->id)->count();
                    return [
                        'id' => $site->id,
                        'name' => $site->name,
                        'code' => $site->code,
                        'region_id' => $site->region_id,
                        'users_count' => $site->users->count(),
                        'assets_count' => $site->assets->count(),
                        'spare_parts_count' => $sparePartsCount,
                        'is_active' => $site->is_active,
                    ];
                })->toArray();

                return [
                    'id' => $region->id,
                    'name' => $region->name,
                    'sites' => $sites,
                    'sites_count' => count($sites),
                    'users_count' => array_sum(array_column($sites, 'users_count')),
                    'assets_count' => array_sum(array_column($sites, 'assets_count')),
                ];
            });

        $allSites = collect($regions->pluck('sites')->flatten(1));
        $stats = [
            'total_sites' => $allSites->count(),
            'active_sites' => $allSites->where('is_active', true)->count(),
            'disabled_sites' => $allSites->where('is_active', false)->count(),
            'total_users' => $allSites->sum('users_count'),
            'total_assets' => $allSites->sum('assets_count'),
            'total_spare_parts' => $allSites->sum('spare_parts_count'),
        ];

        return Inertia::render('MultiSite/Dashboards', [
            'regions' => $regions,
            'stats' => $stats,
        ]);
    }

    public function transfers()
    {
        $transfers = \App\Models\AssetTransfer::with(['asset', 'fromSite', 'toSite', 'requester', 'approver'])
            ->latest()
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'asset_id' => $transfer->asset_id,
                    'asset_tag' => $transfer->asset ? $transfer->asset->asset_id : 'Unknown',
                    'asset_name' => $transfer->asset ? $transfer->asset->product_name : 'Deleted Asset',
                    'from_site' => $transfer->fromSite ? $transfer->fromSite->name : 'Global / Unassigned',
                    'to_site' => $transfer->toSite ? $transfer->toSite->name : 'Deleted Site',
                    'requested_by' => $transfer->requester ? $transfer->requester->name : 'System',
                    'approved_by' => $transfer->approver ? $transfer->approver->name : 'N/A',
                    'status' => $transfer->status,
                    'transfer_date' => $transfer->transfer_date ? $transfer->transfer_date->format('Y-m-d H:i') : null,
                    'notes' => $transfer->notes,
                    'created_at' => $transfer->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('MultiSite/Transfers', [
            'sites' => Site::all(),
            'assets' => Asset::with(['site', 'category', 'status'])
                ->whereHas('status', fn($status) => $status->whereRaw('LOWER(TRIM(name)) = ?', ['available']))
                ->get()
                ->map(fn($asset) => [
                    'id' => $asset->id,
                    'asset_id' => $asset->asset_id,
                    'product_name' => $asset->product_name,
                    'site_id' => $asset->site_id,
                    'category' => $asset->category?->name ?? 'Uncategorized',
                    'status' => strtolower($asset->status?->name ?? 'available'),
                ]),
            'transfers' => $transfers
        ]);
    }

    public function storeTransfer(Request $request)
    {
        $request->validate([
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'exists:assets,id',
            'to_site_id' => 'required|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        foreach ($request->asset_ids as $assetId) {
            $asset = Asset::with('status')->findOrFail($assetId);

            if (strtolower($asset->status?->name ?? '') !== 'available') {
                continue;
            }

            if ((int) $asset->site_id === (int) $request->to_site_id) {
                continue;
            }

            \App\Models\AssetTransfer::create([
                'asset_id' => $asset->id,
                'from_site_id' => $asset->site_id,
                'to_site_id' => $request->to_site_id,
                'requested_by' => auth()->id(),
                'status' => 'pending',
                'notes' => $request->notes,
            ]);
        }

        return redirect()->back()->with('success', 'Asset transfer workflow initiated successfully.');
    }

    public function updateTransferStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,completed',
        ]);

        $transfer = \App\Models\AssetTransfer::findOrFail($id);
        $transfer->status = $request->status;

        if ($request->status === 'approved') {
            $transfer->approved_by = auth()->id();
            $transfer->transfer_date = now();

            $asset = Asset::findOrFail($transfer->asset_id);
            $asset->site_id = $transfer->to_site_id;
            $asset->save();
            $transfer->status = 'completed';
        } elseif ($request->status === 'completed') {
            $transfer->transfer_date = now();
        }

        $transfer->save();

        return redirect()->back()->with('success', 'Transfer workflow updated successfully.');
    }

    public function access()
    {
        return Inertia::render('MultiSite/Access', [
            'sites' => Site::all(),
            'users' => \App\Models\User::with(['roles', 'site'])->get()->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'None',
                    'site' => $user->site ? $user->site->name : 'Global Access',
                    'site_id' => $user->site_id,
                ];
            })
        ]);
    }
}
