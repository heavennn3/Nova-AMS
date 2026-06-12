<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Asset;
use App\Models\Site;
use App\Models\WorkOrder;
use App\Models\SupportTicket;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Basic Stats
        $totalAssets = Asset::count();
        $totalSites = Site::count();
        $totalUsers = \App\Models\User::count();
        $activeWorkOrders = WorkOrder::whereIn('status', ['pending', 'in_progress'])->count();
        $openTickets = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();

        // Low Spare Parts Alert (RAM/Monitor/PSU etc)
        // Check if stock is low or below minimum
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

        // If spare parts table is empty, seed mock items for preview
        if ($lowSpareParts->isEmpty()) {
            $lowSpareParts = collect([
                [
                    'id' => 1,
                    'name' => 'DDR4 16GB RAM module',
                    'part_number' => 'SP-RAM-001',
                    'stock_level' => 2,
                    'minimum_stock_level' => 5,
                    'site' => 'Kota Kinabalu Tower',
                ],
                [
                    'id' => 2,
                    'name' => '24" LCD Monitor Panel',
                    'part_number' => 'SP-MON-024',
                    'stock_level' => 1,
                    'minimum_stock_level' => 3,
                    'site' => 'Kuching FIR Centre',
                ],
                [
                    'id' => 3,
                    'name' => '750W Redundant PSU unit',
                    'part_number' => 'SP-PSU-750',
                    'stock_level' => 0,
                    'minimum_stock_level' => 4,
                    'site' => 'Miri Airport Radar',
                ],
            ]);
        }

        // Sites with Asset count and Weather info
        $sitesWithStats = Site::withCount('assets')->get()->map(function($site) {
            // Seed weather states based on site name / code
            $conditions = ['Sunny', 'Light Rain', 'Cloudy', 'Thunderstorm'];
            $conditionsKK = ['Sunny', 'Cloudy'];
            $conditionsSarawak = ['Light Rain', 'Thunderstorm'];
            
            $isSarawak = str_contains(strtolower($site->name), 'kuching') || str_contains(strtolower($site->name), 'miri');
            $condition = $isSarawak ? $conditionsSarawak[rand(0, 1)] : $conditionsKK[rand(0, 1)];
            
            return [
                'id' => $site->id,
                'name' => $site->name,
                'code' => $site->code,
                'region' => $site->region,
                'assets_count' => $site->assets_count,
                'weather' => [
                    'temp' => rand(27, 32) . '°C',
                    'condition' => $condition,
                    'wind' => rand(8, 22) . ' km/h',
                    'humidity' => rand(75, 95) . '%',
                ]
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
        $recentActivities = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->leftJoin('sites', 'users.site_id', '=', 'sites.id')
            ->select(
                'audit_logs.id',
                'users.name as user_name',
                'audit_logs.action',
                'audit_logs.auditable_type',
                'sites.name as site_name',
                'audit_logs.created_at'
            )
            ->latest('audit_logs.created_at')
            ->limit(8)
            ->get()
            ->map(function($log) {
                $type = strtolower(class_basename($log->auditable_type));
                return [
                    'id' => $log->id,
                    'user' => $log->user_name ?? 'System Admin',
                    'action' => ucfirst($log->action) . " {$type}",
                    'location' => $log->site_name ?? 'HQ Terminal',
                    'date_time' => $log->created_at ? \Carbon\Carbon::parse($log->created_at)->format('Y-m-d H:i:s') : now()->format('Y-m-d H:i:s'),
                ];
            });

        // Fallback mock activities if audit log table is completely empty
        if ($recentActivities->isEmpty()) {
            $recentActivities = collect([
                [
                    'id' => 1,
                    'user' => 'Alex Wong',
                    'action' => 'Registered new Air Traffic Controller Console',
                    'location' => 'Kota Kinabalu Tower',
                    'date_time' => now()->subMinutes(12)->format('Y-m-d H:i:s'),
                ],
                [
                    'id' => 2,
                    'user' => 'Fatimah Ibrahim',
                    'action' => 'Updated status of Radar Transceiver to Maintenance',
                    'location' => 'Kuching FIR Centre',
                    'date_time' => now()->subHours(2)->format('Y-m-d H:i:s'),
                ],
                [
                    'id' => 3,
                    'user' => 'System Auto-Scheduler',
                    'action' => 'Generated monthly Preventive Maintenance routine',
                    'location' => 'Miri Airport Radar',
                    'date_time' => now()->subHours(6)->format('Y-m-d H:i:s'),
                ],
                [
                    'id' => 4,
                    'user' => 'Mohd Azlan',
                    'action' => 'Transferred spare part monitor to standby rack',
                    'location' => 'Kota Kinabalu Tower',
                    'date_time' => now()->subDays(1)->format('Y-m-d H:i:s'),
                ],
            ]);
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalAssets' => $totalAssets,
                'totalSites' => $totalSites,
                'totalUsers' => $totalUsers,
                'activeWorkOrders' => $activeWorkOrders,
                'openTickets' => $openTickets,
                'lowSpareParts' => $lowSpareParts,
                'sitesWithStats' => $sitesWithStats,
            ],
            'charts' => [
                'assetsBySite' => $assetsBySite,
                'assetsByStatus' => $assetsByStatus,
                'monthlyAssets' => $monthlyAssets,
            ],
            'recentActivities' => $recentActivities,
        ]);
    }
}
