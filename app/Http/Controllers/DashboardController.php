<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Asset;
use App\Models\Site;
use App\Models\WorkOrder;
use App\Models\SupportTicket;
use Inertia\Inertia;
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
        $totalRecentAdded = Asset::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $assetsCurrentlyInUse = \App\Models\AssetAssignment::active()->count()
            + \App\Models\AssetLoan::where('status', 'approved')->count();
        $totalOverdue = \App\Models\AssetAssignment::active()->whereDate('assigned_at', '<', today())->count()
            + \App\Models\AssetLoan::overdue()->count();


        // Low Spare Parts Alert (quantity/minimum_stock_level are dynamic fields now)
        $lowSpareParts = \App\Models\SparePart::with(['site', 'fieldValues'])
            ->get()
            ->filter(function ($part) {
                $quantity = (int) ($part->getField('quantity') ?? $part->getField('stock_level') ?? 0);
                $minimumStock = (int) ($part->getField('minimum_stock_level') ?? $part->getField('minimum_stock') ?? 0);

                return $quantity <= $minimumStock || $quantity < 5;
            })
            ->map(function ($part) {
                $quantity = (int) ($part->getField('quantity') ?? $part->getField('stock_level') ?? 0);
                $minimumStock = (int) ($part->getField('minimum_stock_level') ?? $part->getField('minimum_stock') ?? 0);

                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'quantity' => $quantity,
                    'minimum_stock_level' => $minimumStock,
                    'site' => $part->site?->name ?? 'HQ Central Store',
                ];
            })
            ->values();

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

        // Overdue Checkouts — removed (Withdrawals module deleted)
        $overdueCheckouts = collect([]);

        // Warranty Expiring — no longer queryable by old columns, skip for now
        $warrantyExpiring = collect();

        $pendingRequestsCount = \App\Models\AssetRequest::where('status', 'Pending')->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalAssets' => $totalAssets,
                'totalSites' => $totalSites,
                'totalUsers' => $totalUsers,
                'totalRecentAdded' => $totalRecentAdded,

                'lowSpareParts' => $lowSpareParts,
                'sitesWithStats' => $sitesWithStats,
                'pendingRequests' => $pendingRequestsCount,
                'assetsCurrentlyInUse' => $assetsCurrentlyInUse,
                'totalOverdue' => $totalOverdue,
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
