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

    public function warranty() { return Inertia::render('Lifecycle/Warranty'); }
    public function audit() { return Inertia::render('Lifecycle/Audit'); }
}
