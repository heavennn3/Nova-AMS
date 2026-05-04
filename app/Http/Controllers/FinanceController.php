<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class FinanceController extends Controller
{
    public function valuation() { return Inertia::render('Finance/Valuation'); }
    public function budgets() { return Inertia::render('Finance/Budgets'); }
    public function costs() { return Inertia::render('Finance/Costs'); }
    public function requisitions() { return Inertia::render('Finance/Requisitions'); }
    public function insurance() { return Inertia::render('Finance/Insurance'); }
}
