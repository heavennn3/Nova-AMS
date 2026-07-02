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

        // Sites with Asset count
        $sitesWithStats = Site::withCount('assets')->get()->map(function($site) {
            return [
                'id' => $site->id,
                'name' => $site->name,
                'code' => $site->code,
                'region' => $site->region,
                'assets_count' => $site->assets_count,
            ];
        });

        // Assets by Site (Top 5)
        $assetsBySite = Site::withCount('assets')
            ->orderBy('assets_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($site) => [
                'name' => $site->name,
                'value' => $site->assets_count
            ]);

        // Assets by Status
        $assetsByStatus = Asset::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => [
                'name' => ucfirst($item->status ?: 'Unknown'),
                'value' => $item->count
            ]);

        // Monthly Asset Registration (Last 6 months)
        $monthlyAssets = Asset::select(
            DB::raw('DATE_FORMAT(created_at, "%b") as month'),
            DB::raw('count(*) as count'),
            DB::raw('MIN(created_at) as date')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('date')
        ->get()
        ->map(fn($item) => [
            'name' => $item->month,
            'total' => $item->count
        ]);

        // Recent Activities (All users + Date Time + Location)
        $recentActivities = \OwenIt\Auditing\Models\Audit::with(['user.site'])
            ->whereIn('event', ['created', 'updated', 'deleted', 'restored'])
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
                return [
                    'id' => $w->id,
                    'asset_id' => $w->asset?->asset_id ?? '—',
                    'asset_name' => $w->asset?->product_name ?? $w->asset?->asset_name ?? '—',
                    'user_name' => $w->user?->name ?? 'Unknown',
                    'checkout_date' => $w->withdrawal_date?->format('Y-m-d'),
                    'expected_return_date' => $w->expected_return_date?->format('Y-m-d'),
                    'days_late' => (int) $daysLate,
                ];
            });

        // Warranty Expiring Soon — 5 soonest within 90 days
        $today = Carbon::today();
        $ninetyDaysLater = Carbon::today()->addDays(90);

        $warrantyExpiring = Asset::with(['category', 'site'])
            ->where(function ($query) use ($today, $ninetyDaysLater) {
                // Assets with explicit warranty_expiry_date
                $query->where(function ($q) use ($today, $ninetyDaysLater) {
                    $q->whereNotNull('warranty_expiry_date')
                      ->whereBetween('warranty_expiry_date', [$today, $ninetyDaysLater]);
                })
                // OR assets with purchase_date + warranty_months
                ->orWhere(function ($q) use ($today, $ninetyDaysLater) {
                    $q->whereNotNull('purchase_date')
                      ->whereNotNull('warranty_months')
                      ->where('warranty_months', '>', 0)
                      ->whereRaw(
                          'DATE_ADD(purchase_date, INTERVAL warranty_months MONTH) BETWEEN ? AND ?',
                          [$today->toDateString(), $ninetyDaysLater->toDateString()]
                      );
                });
            })
            ->get()
            ->map(function ($asset) use ($today) {
                // Determine expiry date
                $expiryDate = $asset->warranty_expiry_date
                    ? Carbon::parse($asset->warranty_expiry_date)
                    : ($asset->purchase_date && $asset->warranty_months
                        ? Carbon::parse($asset->purchase_date)->addMonths($asset->warranty_months)
                        : null);

                if (!$expiryDate) return null;

                $daysRemaining = (int) $today->diffInDays($expiryDate, false);

                return [
                    'id' => $asset->id,
                    'asset_id' => $asset->asset_id,
                    'asset_name' => $asset->product_name ?? $asset->asset_name ?? '—',
                    'category' => $asset->category?->name ?? '—',
                    'site' => $asset->site?->name ?? '—',
                    'expiry_date' => $expiryDate->format('Y-m-d'),
                    'days_remaining' => max(0, $daysRemaining),
                ];
            })
            ->filter()
            ->sortBy('days_remaining')
            ->take(5)
            ->values();

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
                'monthlyAssets' => $monthlyAssets,
            ],
            'recentActivities' => $recentActivities,
            'overdueCheckouts' => $overdueCheckouts,
            'warrantyExpiring' => $warrantyExpiring,
        ]);
    }
}
