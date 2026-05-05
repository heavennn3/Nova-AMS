<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AssetLifecycleController extends Controller
{
    public function status() { return Inertia::render('Lifecycle/Status'); }

    public function warranty() { return Inertia::render('Lifecycle/Warranty'); }
    public function health() { return Inertia::render('Lifecycle/Health'); }
    public function audit() { return Inertia::render('Lifecycle/Audit'); }
}
