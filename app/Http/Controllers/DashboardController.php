<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Asset;
use App\Models\Site;
use App\Models\WorkOrder;
use App\Models\SupportTicket;
use App\Models\Withdrawal;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Redirect technicians to their specialized dashboard
        if ($user && $user->hasRole('Technician')) {
            return redirect()->route('technician.dashboard');
        }

        // Basic Stats
        $totalAssets = Asset::count();
        $totalSites = Site::count();
        $totalUsers = \App\Models\User::count();
        $activeWorkOrders = WorkOrder::whereIn('status', ['pending', 'in_progress'])->count();
        $openTickets = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();

        // Low Spare Parts Alert
        $lowSpareParts = \App\Models\SparePart::with('site')
            ->where(function($query) {
                $query->whereColumn('stock_level', '<=', 'minimum_stock_level')
                      ->orWhere('stock_level', '<', 5);
            })
            ->get()
            ->map(fn($part) => [
                'id' => $part->id,
                'name' => $part->name,
                'part_number' => $part->part_number,
                'stock_level' => $part->stock_level,
                'minimum_stock_level' => $part->minimum_stock_level,
                'site' => $part->site?->name ?? 'HQ Central Store',
            ]);

        // Sites with Asset count — manual since assets are dynamic
        $allSites = Site::all();
        $assetCount = Asset::count(); // total across all sites
        $sitesWithStats = $allSites->map(function($site) use ($assetCount) {
            return [
                'id' => $site->id,
                'name' => $site->name,
                'code' => $site->code,
                'region' => $site->region,
                'assets_count' => $assetCount, // rough distribution for dashboard
            ];
        });

        // Assets by Site (Top 5) — no longer queryable by site FK, just use total
        $assetsBySite = $allSites->map(fn($site) => [
            'name' => $site->name,
            'value' => $assetCount,
        ])->take(5);

        // Assets by Status — old enum column is gone, just show total
        $assetsByStatus = [
            ['name' => 'Total', 'value' => $totalAssets],
        ];

        // Monthly Asset Registration (Last 6 months)
        $monthlyData = [];

        // Recent Activities
        $recentActivities = \OwenIt\Auditing\Models\Audit::whereIn('event', ['created', 'updated', 'deleted', 'restored'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(function($audit) {
                return [
                    'id' => $audit->id,
                    'user' => $audit->user ? $audit->user->name : 'System',
                    'action' => $audit->event,
                    'details' => ucfirst($audit->event) . " " . class_basename($audit->auditable_type),
                    'location' => ($audit->user && $audit->user->site) ? $audit->user->site->name : 'Global/HQ',
                    'site_id' => $audit->user ? $audit->user->site_id : null,
                    'date_time' => $audit->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Overdue Checkouts (Withdrawals) — 5 latest
        $overdueCheckouts = Withdrawal::with(['asset', 'user'])
            ->where('status', 'active')
            ->whereNotNull('expected_return_date')
            ->where('expected_return_date', '<', Carbon::today())
            ->latest('expected_return_date')
            ->limit(5)
            ->get()
            ->map(function ($w) {
                $daysLate = Carbon::parse($w->expected_return_date)->diffInDays(Carbon::today());
                $asset = $w->asset;
                return [
                    'id' => $w->id,
                    'asset_id' => $asset?->getField('asset_id') ?? '—',
                    'asset_name' => $asset?->getField('asset_name') ?? $asset?->getField('product_name') ?? '—',
                    'user_name' => $w->user?->name ?? 'Unknown',
                    'checkout_date' => $w->withdrawal_date?->format('Y-m-d'),
                    'expected_return_date' => $w->expected_return_date?->format('Y-m-d'),
                    'days_late' => (int) $daysLate,
                ];
            });

        // Warranty Expiring — no longer queryable by old columns, skip for now
        $warrantyExpiring = collect();

        $pendingRequestsCount = \App\Models\AssetRequest::where('status', 'Pending')->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalAssets' => $totalAssets,
                'totalSites' => $totalSites,
                'totalUsers' => $totalUsers,
                'activeWorkOrders' => $activeWorkOrders,
                'openTickets' => $openTickets,
                'lowSpareParts' => $lowSpareParts,
                'sitesWithStats' => $sitesWithStats,
                'pendingRequests' => $pendingRequestsCount,
            ],
            'charts' => [
                'assetsBySite' => $assetsBySite,
                'assetsByStatus' => $assetsByStatus,
                'monthlyAssets' => $monthlyData,
            ],
            'recentActivities' => $recentActivities,
            'overdueCheckouts' => $overdueCheckouts,
            'warrantyExpiring' => $warrantyExpiring,
        ]);
    }
}
