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
        $activeWorkOrders = WorkOrder::whereIn('status', ['pending', 'in_progress'])->count();
        $openTickets = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();

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

        // Recent Activities (Combined from Audits if available, else recent assets/tickets)
        // For simplicity, let's just get recent assets and tickets
        $recentAssets = Asset::with('site')->latest()->limit(5)->get()->map(fn($a) => [
            'id' => $a->id,
            'type' => 'asset',
            'title' => "New Asset Registered: {$a->product_name}",
            'description' => "Site: {$a->site?->name}",
            'time' => $a->created_at->diffForHumans(),
        ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalAssets' => $totalAssets,
                'totalSites' => $totalSites,
                'activeWorkOrders' => $activeWorkOrders,
                'openTickets' => $openTickets,
            ],
            'charts' => [
                'assetsBySite' => $assetsBySite,
                'assetsByStatus' => $assetsByStatus,
                'monthlyAssets' => $monthlyAssets,
            ],
            'recentActivities' => $recentAssets,
        ]);
    }
}
