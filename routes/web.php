<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\LocationController;

Route::inertia('/', 'nova-ams', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Nova AMS');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
    
    // Main navigation pages
    Route::inertia('/asset-inventory', 'asset-inventory')->name('asset-inventory');
    Route::inertia('/geographic-view', 'geographic-view')->name('geographic-view');
    Route::inertia('/master-data', 'master-data')->name('master-data');
    Route::inertia('/operations-maintanance', 'operations-maintanance')->name('operations-maintenance');
    
    // Asset CRUD (this automatically handles: index, create, store, show, edit, update, destroy)
    Route::resource('assets', AssetController::class);
    
    // Master data CRUD
    Route::resource('categories', AssetCategoryController::class);
    Route::resource('vendors', VendorController::class);
    Route::resource('locations', LocationController::class);
});

require __DIR__.'/settings.php';