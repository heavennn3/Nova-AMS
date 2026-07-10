<?php

use Illuminate\Support\Facades\Route;

// ─── Public / health ──────────────────────────────────────────────
Route::get('/health', fn () => response()->json([
    'status'  => 'ok',
    'time'    => now()->toIso8601String(),
]));

// ─── Authenticated (SPA session + API token) ─────────────────────
Route::middleware(['auth'])->group(function () {

    // System
    Route::get('/system/monitoring', [\App\Http\Controllers\Api\SystemApiController::class, 'monitoring']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationApiController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationApiController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationApiController::class, 'markAllAsRead']);

    // Assets
    Route::prefix('assets')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\AssetApiController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\AssetApiController::class, 'store']);
        Route::get('/{asset}', [\App\Http\Controllers\Api\AssetApiController::class, 'show']);
        Route::put('/{asset}', [\App\Http\Controllers\Api\AssetApiController::class, 'update']);
        Route::delete('/{asset}', [\App\Http\Controllers\Api\AssetApiController::class, 'destroy']);

        Route::post('/scan', [\App\Http\Controllers\Api\AssetApiController::class, 'processScan']);
        Route::post('/scan-bulk', [\App\Http\Controllers\Api\AssetApiController::class, 'processBulkScan']);
        Route::get('/lookup/{scannedValue}', [\App\Http\Controllers\Api\AssetApiController::class, 'lookup']);

        Route::patch('/{asset}/status', [\App\Http\Controllers\Api\AssetApiController::class, 'updateStatus']);
        Route::post('/bulk-update-status', [\App\Http\Controllers\Api\AssetApiController::class, 'bulkUpdateStatus']);

        Route::post('/import-bulk', [\App\Http\Controllers\Api\AssetApiController::class, 'importBulk']);
        Route::get('/export', [\App\Http\Controllers\Api\AssetApiController::class, 'exportCsv']);

        // Assignments
        Route::post('/{asset}/checkout', [\App\Http\Controllers\Api\AssetApiController::class, 'checkout']);
        Route::post('/{asset}/checkin', [\App\Http\Controllers\Api\AssetApiController::class, 'checkin']);
        Route::get('/{asset}/assignments', [\App\Http\Controllers\Api\AssetApiController::class, 'assignments']);
    });

    // Live Tracking
    Route::prefix('live-tracking')->group(function () {
        Route::get('/poll', [\App\Http\Controllers\Api\TrackingApiController::class, 'poll']);
        Route::get('/history', [\App\Http\Controllers\Api\TrackingApiController::class, 'history']);
        Route::get('/report', [\App\Http\Controllers\Api\TrackingApiController::class, 'report']);
    });

    // Reference data (categories, types, oems, sites, locations, …)
    Route::get('/references/categories', [\App\Http\Controllers\Api\ReferenceApiController::class, 'categories']);
    Route::get('/references/types', [\App\Http\Controllers\Api\ReferenceApiController::class, 'types']);
    Route::get('/references/oems', [\App\Http\Controllers\Api\ReferenceApiController::class, 'oems']);
    Route::get('/references/sites', [\App\Http\Controllers\Api\ReferenceApiController::class, 'sites']);
    Route::get('/references/locations', [\App\Http\Controllers\Api\ReferenceApiController::class, 'locations']);
    Route::get('/references/asset-statuses', [\App\Http\Controllers\Api\ReferenceApiController::class, 'assetStatuses']);

    // Regions
    Route::apiResource('regions', \App\Http\Controllers\Api\RegionApiController::class);

    // Sites
    Route::get('/sites', [\App\Http\Controllers\Api\SiteApiController::class, 'index']);
    Route::post('/sites', [\App\Http\Controllers\Api\SiteApiController::class, 'store']);
    Route::get('/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'show']);
    Route::put('/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'update']);
    Route::delete('/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'destroy']);

    // Quick creation (inline forms)
    Route::post('/quick/vendors', [\App\Http\Controllers\Api\QuickApiController::class, 'storeVendor']);
    Route::post('/quick/types', [\App\Http\Controllers\Api\QuickApiController::class, 'storeType']);
    Route::post('/quick/sites', [\App\Http\Controllers\Api\QuickApiController::class, 'storeSite']);
    Route::post('/quick/locations', [\App\Http\Controllers\Api\QuickApiController::class, 'storeLocation']);
    Route::post('/quick/suppliers', [\App\Http\Controllers\Api\QuickApiController::class, 'storeSupplier']);
    Route::post('/quick/status-labels', [\App\Http\Controllers\Api\QuickApiController::class, 'storeStatusLabel']);
    Route::post('/quick/bulk-import', [\App\Http\Controllers\Api\QuickApiController::class, 'bulkImport']);
    Route::post('/quick/bulk-delete', [\App\Http\Controllers\Api\QuickApiController::class, 'bulkDelete']);
    Route::post('/quick/bulk-status', [\App\Http\Controllers\Api\QuickApiController::class, 'bulkStatus']);

    // Recycle bin
    Route::prefix('recycle-bin')->group(function () {
        Route::post('/bulk-restore', [\App\Http\Controllers\Api\RecycleBinApiController::class, 'bulkRestore']);
        Route::post('/bulk-delete', [\App\Http\Controllers\Api\RecycleBinApiController::class, 'bulkForceDelete']);
    });
});
