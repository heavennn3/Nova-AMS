<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrder;
use App\Models\SparePart;
use App\Models\Site;
use App\Models\Asset;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TechnicianController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();

        // Get work orders assigned to the technician
        $myWorkOrders = WorkOrder::with(['asset'])
            ->where('assigned_to', $user->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($wo) use ($user) {
                $title = 'Work Order #' . $wo->id;
                if ($wo->asset) {
                    $title .= ' - ' . ($wo->asset->product_name ?? $wo->asset->asset_name ?? 'Unknown Asset');
                }
                if ($wo->issue) {
                    $title .= ': ' . $wo->issue;
                }

                // Map status to match the frontend expectations
                $statusMap = [
                    'open' => 'pending',
                    'in_progress' => 'in progress',
                    'completed' => 'completed',
                    'closed' => 'completed'
                ];
                $status = $statusMap[$wo->status] ?? $wo->status;

                return [
                    'id' => $wo->id,
                    'title' => $title,
                    'status' => $status,
                    'priority' => $wo->priority ?: 'medium',
                    'assigned_to' => $wo->technician?->name ?? $user->name,
                    'due_date' => $wo->reported_at?->format('Y-m-d') ?? 'No date',
                    'asset' => $wo->asset ? [
                        'name' => $wo->asset->product_name ?? $wo->asset->asset_name ?? 'Unknown Asset',
                        'asset_id' => $wo->asset->asset_id ?? 'N/A',
                    ] : null,
                ];
            });

        // Get low stock spare parts for technician's sites
        $siteIds = $user->sites()->pluck('sites.id')->toArray();
        if (empty($siteIds) && $user->site_id) {
            $siteIds = [$user->site_id];
        }

        $lowStockParts = SparePart::with('site')
            ->whereIn('site_id', $siteIds)
            ->where(function($query) {
                $query->whereColumn('stock_level', '<=', 'minimum_stock_level')
                      ->orWhere('stock_level', '<=', 5);
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'stock_level' => $part->stock_level,
                    'minimum_stock_level' => $part->minimum_stock_level,
                    'location' => $part->location ?: 'Main Store',
                    'site' => $part->site?->name ?: 'Unknown',
                ];
            });

        // Get site statistics for technician's assigned sites
        $siteStats = Site::whereIn('id', $siteIds)
            ->get()
            ->map(function ($site) {
                // Calculate operational rate (assets not in maintenance / total assets)
                $totalAssets = Asset::count();
                $pendingMaintenance = WorkOrder::whereIn('status', ['pending', 'in_progress'])
                    ->whereHas('asset.assignments', fn($q) => $q->where('site_id', $site->id))
                    ->count();

                $operationalRate = $totalAssets > 0
                    ? round((($totalAssets - $pendingMaintenance) / $totalAssets) * 100, 1)
                    : 100;

                return [
                    'id' => $site->id,
                    'name' => $site->name,
                    'code' => $site->code,
                    'assets_count' => $totalAssets,
                    'pending_maintenance' => $pendingMaintenance,
                    'operational_rate' => $operationalRate,
                ];
            });

        // Get recent activities for the technician
        $recentActivities = \OwenIt\Auditing\Models\Audit::with(['user.site'])
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
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

        // Count pending approvals (if any)
        $pendingApprovals = 0; // Technicians typically don't have approvals, but can be extended

        return Inertia::render('technician/dashboard', [
            'myWorkOrders' => $myWorkOrders,
            'lowStockParts' => $lowStockParts,
            'siteStats' => $siteStats,
            'recentActivities' => $recentActivities,
            'pendingApprovals' => $pendingApprovals,
        ]);
    }
}