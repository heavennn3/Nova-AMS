<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class OperationsController extends Controller
{
    // Main Dashboard
    public function dashboard()
    {
        return Inertia::render('operations-maintanance');
    }

    // Maintenance
    public function scheduling() { return Inertia::render('Maintenance/Scheduling'); }
    public function workOrders() { return Inertia::render('Maintenance/WorkOrders'); }
    public function history() { return Inertia::render('Maintenance/History'); }
    public function parts() { return Inertia::render('Maintenance/Parts'); }
    public function technicians() { return Inertia::render('Maintenance/Technicians'); }

    // Vendors
    public function performance() { return Inertia::render('Vendors/Performance'); }
    public function alerts() { return Inertia::render('Vendors/Alerts'); }
    public function slas() { return Inertia::render('Vendors/Slas'); }
    public function po() { return Inertia::render('Vendors/PurchaseOrders'); }
    public function portal() { return Inertia::render('Vendors/Portal'); }
}
