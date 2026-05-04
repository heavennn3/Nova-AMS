<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SecurityController extends Controller
{
    public function logs() { return Inertia::render('Security/Logs'); }
}
