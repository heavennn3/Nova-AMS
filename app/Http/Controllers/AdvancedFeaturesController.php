<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AdvancedFeaturesController extends Controller
{
    public function api() { return Inertia::render('Advanced/Api'); }
    public function barcodes() { return Inertia::render('Advanced/Barcodes'); }
    public function mobile() { return Inertia::render('Advanced/Mobile'); }
    public function offline() { return Inertia::render('Advanced/Offline'); }
    public function notifications() { return Inertia::render('Advanced/Notifications'); }
    public function data() { return Inertia::render('Advanced/Data'); }
}
