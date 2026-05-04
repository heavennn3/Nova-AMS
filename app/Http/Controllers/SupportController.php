<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class SupportController extends Controller
{
    public function tickets()
    {
        return Inertia::render('Support/Tickets');
    }
}
