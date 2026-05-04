<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DocumentManagementController extends Controller
{
    public function assets() { return Inertia::render('Documents/Assets'); }
    public function maintenance() { return Inertia::render('Documents/Maintenance'); }
    public function contracts() { return Inertia::render('Documents/Contracts'); }
    public function versions() { return Inertia::render('Documents/Versions'); }
    public function alerts() { return Inertia::render('Documents/Alerts'); }
}
