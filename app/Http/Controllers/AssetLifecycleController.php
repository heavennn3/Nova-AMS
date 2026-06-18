<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Asset;

class AssetLifecycleController extends Controller
{
    public function status() 
    { 
        return Inertia::render('Lifecycle/Status', [
            'assets' => Asset::with(['site', 'category'])->get()
        ]); 
    }

    public function health() 
    { 
        $assets = Asset::with(['site', 'category'])->get()->map(function($asset) {
            // Health Scoring Logic (0-100)
            $score = 100;
            
            // Age Factor (minus 5 points per year over 3 years)
            $age = now()->year - ($asset->purchase_year ?: now()->year);
            if ($age > 3) {
                $score -= ($age - 3) * 5;
            }

            // Condition Factor
            $conditionScores = [
                'excellent' => 0,
                'good' => -10,
                'fair' => -30,
                'poor' => -60,
                'faulty' => -100
            ];
            $score += $conditionScores[strtolower($asset->condition_status)] ?? 0;

            // Status Factor
            if ($asset->status === 'under_maintenance') {
                $score -= 20;
            }

            $asset->health_score = max(0, min(100, $score));
            return $asset;
        })->sortBy('health_score')->values();

        return Inertia::render('Lifecycle/Health', [
            'assets' => $assets
        ]); 
    }

    public function warranty()
    {
        $assets = Asset::with(['supplier', 'site'])
            ->where(function($query) {
                $query->whereNotNull('warranty_months')
                    ->where('warranty_months', '>', 0)
                    ->orWhereNotNull('purchase_date');
            })
            ->get();

        return Inertia::render('Lifecycle/Warranty', [
            'assets' => $assets
        ]);
    }
    public function audit()
    {
        $audits = \OwenIt\Auditing\Models\Audit::with(['user', 'auditable'])
            ->where('auditable_type', 'like', '%Asset%')
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        return Inertia::render('Lifecycle/Audit', [
            'audits' => $audits
        ]);
    }

    public function procurement()
    {
        $assets = Asset::with(['supplier', 'site', 'category'])
            ->where(function($query) {
                $query->whereNotNull('purchase_cost')
                    ->orWhereNotNull('order_number');
            })
            ->orderBy('purchase_date', 'desc')
            ->get();

        $totalCost = $assets->sum(function($asset) {
            return floatval($asset->purchase_cost ?? 0);
        });

        $averageCost = $assets->count() > 0 ? $totalCost / $assets->count() : 0;

        $costBySupplier = $assets->groupBy('supplier_id')->map(function($group) {
            return [
                'supplier_id' => $group->first()->supplier_id,
                'supplier_name' => $group->first()->supplier->name ?? 'Unknown',
                'total_cost' => $group->sum(function($asset) {
                    return floatval($asset->purchase_cost ?? 0);
                }),
                'count' => $group->count()
            ];
        })->sortByDesc('total_cost')->values()->toArray();

        return Inertia::render('Lifecycle/Procurement', [
            'assets' => $assets,
            'summary' => [
                'total_cost' => $totalCost,
                'total_assets' => $assets->count(),
                'average_cost' => $averageCost,
                'cost_by_supplier' => $costBySupplier,
            ]
        ]);
    }

    public function endOfLife()
    {
        $assets = Asset::with(['site', 'category'])
            ->where(function($query) {
                $query->whereNotNull('eol_date')
                    ->orWhereNotNull('purchase_date');
            })
            ->get();

        return Inertia::render('Lifecycle/EndOfLife', [
            'assets' => $assets
        ]);
    }
}
