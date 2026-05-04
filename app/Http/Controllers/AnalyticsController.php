<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function utilization() { return Inertia::render('Analytics/Utilization'); }
    public function costs() { return Inertia::render('Analytics/Costs'); }
    public function availability() { return Inertia::render('Analytics/Availability'); }
    public function compliance() { return Inertia::render('Analytics/Compliance'); }
    public function predictive() { return Inertia::render('Analytics/Predictive'); }
    public function heatmaps() { return Inertia::render('Analytics/Heatmaps'); }
}
