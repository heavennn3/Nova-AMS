<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('settings', function () {
        return Inertia::render('admin/settings', [
            'systemInfo' => [
                'novaAmsVersion' => 'v1.0.0 build 22854 (gcfa8069953)',
                'phpVersion' => PHP_VERSION,
                'laravelVersion' => app()->version(),
                'databaseDriver' => DB::connection()->getDriverName(),
                'timezone' => config('app.timezone'),
                'mailFromAddress' => config('mail.from.address') ?? 'info@nova-ams.com',
                'mailReplyToAddress' => config('mail.from.address') ?? 'info@nova-ams.com',
                'apiBaseUrl' => url('/api/v1'),
                'scimBaseUrl' => url('/scim/v2'),
                'tableStorage' => 'localStorage',
            ]
        ]);
    })->name('settings.index');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
