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
                'site_id'      => $asset->site_id,
                'site_name'    => $asset->site?->name,
                'status'       => $asset->status,
            ]);

        $users = User::with('sites')->select('id', 'name', 'email')->orderBy('name')->get()->map(fn($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'site_ids' => $u->sites->pluck('id')->toArray(),
        ]);

        $sites = \App\Models\Site::select('id', 'name')->orderBy('name')->get();

        $stats = [
            'total_assets'    => Asset::count(),
            'in_use'          => AssetAssignment::active()->count(),
            'available'       => Asset::where('status', 'available')->count(),
            'returned_today'  => AssetAssignment::whereDate('returned_at', today())
                                    ->where('status', 'returned')->count(),
            'total_history'   => AssetAssignment::where('status', 'returned')->count(),
        ];

        // Pass first page of history inline
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
            'sites'           => $sites,
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

        $availableAssets = Asset::with(['category', 'site'])
            ->where('status', 'available')
            ->get()
            ->map(fn($asset) => [
                'id'           => $asset->id,
                'asset_id'     => $asset->asset_id,
                'product_name' => $asset->product_name,
                'category'     => $asset->category?->name,
                'site_id'      => $asset->site_id,
                'site_name'    => $asset->site?->name,
                'status'       => $asset->status,
            ]);

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
            'availableAssets' => $availableAssets,
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

        $asset = Asset::find($validated['asset_id']);

        AssetAssignment::create([
            'asset_id'    => $asset->id,
            'user_id'     => $validated['user_id'],
            'site_id'     => $asset->site_id,
            'location_id' => $asset->location_id,
            'assigned_at' => Carbon::now(),
            'status'      => 'active',
            'remarks'     => $validated['remarks'] ?? null,
        ]);

        // Mark asset as in_use
        $asset->update(['status' => 'in_use']);

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
                'asset.type',
                'asset.vendor',
                'site',
                'location',
                'user',
            ])
            ->where('status', 'returned');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('asset', fn($a) => $a
                    ->where('product_name', 'like', "%{$search}%")
                    ->orWhere('asset_id', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                )
                ->orWhereHas('user', fn($u) => $u
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                );
            });
        }

        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('assigned_at', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('assigned_at', '<=', $endDate);
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
            'site'         => $a->site?->name ?? $a->asset?->site?->name ?? '—',
            'location'     => $a->location?->name ?? $a->asset?->location?->name ?? '—',
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
            'site'            => $a->site?->name ?? $a->asset?->site?->name ?? '—',
            'location'        => $a->location?->name ?? $a->asset?->location?->name ?? '—',
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

    /**
     * Export history as CSV report.
     */
    public function report(Request $request)
    {
        $query = AssetAssignment::with([
                'asset.category',
                'asset.type',
                'asset.vendor',
                'site',
                'location',
                'user',
            ])
            ->where('status', 'returned');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('asset', fn($a) => $a
                    ->where('product_name', 'like', "%{$search}%")
                    ->orWhere('asset_id', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                )
                ->orWhereHas('user', fn($u) => $u
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                );
            });
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('assigned_at', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->whereDate('assigned_at', '<=', $endDate);
        }

        $records = $query->latest('returned_at')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=asset_withdrawal_report_" . date('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($records) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Asset ID', 'Product Name', 'Serial Number', 'Category', 'Site', 'Location',
                'User Name', 'User Email', 'Assigned At', 'Returned At', 'Duration', 'Remarks'
            ]);

            foreach ($records as $r) {
                $formatted = $this->formatHistoryRecord($r);
                fputcsv($file, [
                    $formatted['asset_id'],
                    $formatted['product_name'],
                    $formatted['serial_number'],
                    $formatted['category'],
                    $formatted['site'],
                    $formatted['location'],
                    $formatted['user_name'],
                    $formatted['user_email'],
                    $formatted['assigned_at'],
                    $formatted['returned_at'],
                    $formatted['duration'],
                    $formatted['remarks'],
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function humanDuration(int $mins): string
    {
        if ($mins < 1)    return 'Just now';
        if ($mins < 60)   return "{$mins}m";
        if ($mins < 1440) return sprintf('%dh %dm', intdiv($mins, 60), $mins % 60);
        return sprintf('%dd %dh', intdiv($mins, 1440), intdiv($mins % 1440, 60));
    }
}
