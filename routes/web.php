<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'nova-ams', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Nova AMS');





Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/asset-inventory', 'asset-inventory');
        Route::inertia('/geographic-view', 'geographic-view');
        Route::inertia('/master-data', 'master-data');
        Route::inertia('/operations-maintanance', 'operations-maintanance');
    


});

require __DIR__.'/settings.php';
