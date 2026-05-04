<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\User;
use Carbon\Carbon;

class AssetTrackingController extends Controller
{
    /**
     * Live tracking dashboard page (Inertia).
     */
    public function index()
    {
        $liveAssignments = AssetAssignment::with([
                'asset.category',
                'asset.site',
                'asset.location',
                'user',
            ])
            ->active()
            ->latest('assigned_at')
            ->get()
            ->map(fn($a) => $this->formatAssignment($a));

        $availableAssets = Asset::with(['category', 'site'])
            ->where('status', 'available')
            ->get()
            ->map(fn($asset) => [
                'id'           => $asset->id,
                'asset_id'     => $asset->asset_id,
                'product_name' => $asset->product_name,
                'category'     => $asset->category?->name,
                'site'         => $asset->site?->name,
                'status'       => $asset->status,
            ]);

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        $stats = [
            'total_assets'    => Asset::count(),
            'in_use'          => AssetAssignment::active()->count(),
            'available'       => Asset::where('status', 'available')->count(),
            'returned_today'  => AssetAssignment::whereDate('returned_at', today())
                                    ->where('status', 'returned')->count(),
            'total_history'   => AssetAssignment::where('status', 'returned')->count(),
        ];

        // Pass first page of history inline so the tab loads instantly
        $history = AssetAssignment::with([
                'asset.category',
                'asset.site',
                'asset.type',
                'asset.vendor',
                'user',
            ])
            ->where('status', 'returned')
            ->latest('returned_at')
            ->paginate(50);

        return Inertia::render('Assets/LiveTracking', [
            'liveAssignments' => $liveAssignments,
            'availableAssets' => $availableAssets,
            'users'           => $users,
            'stats'           => $stats,
            'history'         => $history->getCollection()->map(fn($a) => $this->formatHistoryRecord($a))->values(),
            'historyMeta'     => [
                'total'        => $history->total(),
                'per_page'     => $history->perPage(),
                'current_page' => $history->currentPage(),
                'last_page'    => $history->lastPage(),
            ],
        ]);
    }


    /**
     * JSON polling endpoint — called by the frontend every N seconds.
     */
    public function poll()
    {
        $liveAssignments = AssetAssignment::with([
                'asset.category',
                'asset.site',
                'user',
            ])
            ->active()
            ->latest('assigned_at')
            ->get()
            ->map(fn($a) => $this->formatAssignment($a));

        $stats = [
            'total_assets'   => Asset::count(),
            'in_use'         => AssetAssignment::active()->count(),
            'available'      => Asset::where('status', 'available')->count(),
            'returned_today' => AssetAssignment::whereDate('returned_at', today())
                                    ->where('status', 'returned')->count(),
            'total_history'  => AssetAssignment::where('status', 'returned')->count(),
        ];

        return response()->json([
            'liveAssignments' => $liveAssignments,
            'stats'           => $stats,
            'timestamp'       => now()->toIso8601String(),
        ]);
    }

    /**
     * Assign (check out) an asset to a user.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'user_id'  => 'required|exists:users,id',
            'remarks'  => 'nullable|string|max:500',
        ]);

        // Prevent double-assignment
        $existing = AssetAssignment::where('asset_id', $validated['asset_id'])
            ->active()->first();
        if ($existing) {
            return back()->withErrors(['asset_id' => 'This asset is already checked out.']);
        }

        AssetAssignment::create([
            'asset_id'    => $validated['asset_id'],
            'user_id'     => $validated['user_id'],
            'assigned_at' => Carbon::now(),
            'status'      => 'active',
            'remarks'     => $validated['remarks'] ?? null,
        ]);

        // Mark asset as in_use
        Asset::find($validated['asset_id'])->update(['status' => 'in_use']);

        return back()->with('success', 'Asset checked out successfully.');
    }

    /**
     * Return (check in) an asset.
     */
    public function checkin(Request $request, AssetAssignment $assignment)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:500',
        ]);

        $assignment->update([
            'returned_at' => Carbon::now(),
            'status'      => 'returned',
            'remarks'     => $request->remarks ?? $assignment->remarks,
        ]);

        // Mark asset available again
        if ($assignment->asset) {
            $assignment->asset->update(['status' => 'available']);
        }

        return back()->with('success', 'Asset returned successfully.');
    }

    /**
     * JSON endpoint for history — supports search & pagination.
     */
    public function history(Request $request)
    {
        $query = AssetAssignment::with([
                'asset.category',
                'asset.site',
                'asset.type',
                'asset.vendor',
                'user',
            ])
            ->where('status', 'returned');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('asset', fn($a) => $a
                    ->where('product_name', 'like', "%{$search}%")
                    ->orWhere('asset_id', 'like', "%{$search}%")
                )
                ->orWhereHas('user', fn($u) => $u
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                );
            });
        }

        $records = $query->latest('returned_at')->paginate(50);

        return response()->json([
            'data' => $records->getCollection()->map(fn($a) => $this->formatHistoryRecord($a))->values(),
            'meta' => [
                'total'        => $records->total(),
                'per_page'     => $records->perPage(),
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
            ],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function formatAssignment(AssetAssignment $a): array
    {
        $mins = (int) Carbon::parse($a->assigned_at)->diffInMinutes(now());
        $duration = $this->humanDuration($mins);

        return [
            'id'           => $a->id,
            'asset_id'     => $a->asset?->asset_id ?? '—',
            'asset_db_id'  => $a->asset_id,
            'product_name' => $a->asset?->product_name ?? '—',
            'category'     => $a->asset?->category?->name ?? '—',
            'site'         => $a->asset?->site?->name ?? '—',
            'user_name'    => $a->user?->name ?? 'Unknown',
            'user_email'   => $a->user?->email ?? '',
            'assigned_at'  => $a->assigned_at?->toIso8601String(),
            'duration'     => $duration,
            'remarks'      => $a->remarks,
        ];
    }

    private function formatHistoryRecord(AssetAssignment $a): array
    {
        $start = $a->assigned_at ? Carbon::parse($a->assigned_at) : null;
        $end   = $a->returned_at ? Carbon::parse($a->returned_at) : null;
        $mins  = ($start && $end) ? (int) $start->diffInMinutes($end) : null;

        return [
            'id'              => $a->id,
            // Asset detail
            'asset_id'        => $a->asset?->asset_id ?? '—',
            'product_name'    => $a->asset?->product_name ?? '—',
            'serial_number'   => $a->asset?->serial_number ?? '—',
            'brand'           => $a->asset?->brand ?? '—',
            'category'        => $a->asset?->category?->name ?? '—',
            'type'            => $a->asset?->type?->name ?? '—',
            'site'            => $a->asset?->site?->name ?? '—',
            'vendor'          => $a->asset?->vendor?->name ?? '—',
            'purchase_year'   => $a->asset?->purchase_year ?? '—',
            'status'          => $a->asset?->status ?? '—',
            // User detail
            'user_name'       => $a->user?->name ?? 'Unknown',
            'user_email'      => $a->user?->email ?? '—',
            'user_site'       => $a->user?->site?->name ?? '—',
            // Timeline
            'assigned_at'     => $start?->toIso8601String(),
            'returned_at'     => $end?->toIso8601String(),
            'duration'        => $mins !== null ? $this->humanDuration($mins) : '—',
            'remarks'         => $a->remarks ?? 'No remarks provided.',
        ];
    }

    private function humanDuration(int $mins): string
    {
        if ($mins < 1)    return 'Just now';
        if ($mins < 60)   return "{$mins}m";
        if ($mins < 1440) return sprintf('%dh %dm', intdiv($mins, 60), $mins % 60);
        return sprintf('%dd %dh', intdiv($mins, 1440), intdiv($mins % 1440, 60));
    }
}
