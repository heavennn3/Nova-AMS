<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'nova-ams', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Nova AMS');

Route::middleware(['auth', 'verified'])->group(function () {

    // ── Always accessible (dashboard + monitoring) ──────────────────────────
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Support Ticket
    Route::get('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'index'])->name('support.tickets');
    Route::post('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'store'])->name('support.tickets.store');
    Route::get('/support/tickets/{ticket}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets/{ticket}/message', [\App\Http\Controllers\SupportTicketController::class, 'message'])->name('support.tickets.message');
    Route::patch('/support/tickets/{ticket}/status', [\App\Http\Controllers\SupportTicketController::class, 'updateStatus'])->name('support.tickets.status');

    Route::get('/api/system/monitoring', function () {
        $diskFree  = disk_free_space('/');
        $diskTotal = disk_total_space('/');
        $diskUsage = round(100 - ($diskFree / $diskTotal) * 100);
        $load = sys_getloadavg();
        $cpu  = min(100, round($load[0] * 15, 1));
        $ram  = 45 + sin(time() / 10) * 15;
        return response()->json([
            'cpu'  => number_format($cpu, 1),
            'ram'  => number_format($ram, 1),
            'disk' => $diskUsage,
        ]);
    });

    // Notification
    Route::get('/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/api/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/api/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);


    // Asset Inventory 
    Route::middleware(['permission:module.asset-inventory'])->group(function () {
        Route::inertia('/asset-inventory', 'asset-inventory')->name('asset-inventory');
        Route::post('assets/import-bulk', [\App\Http\Controllers\AssetController::class, 'importBulk'])->name('assets.import');
        Route::get('/assets/export', [\App\Http\Controllers\AssetController::class, 'exportCsv'])->name('assets.export');
        Route::resource('assets', \App\Http\Controllers\AssetController::class);

        // Asset Tracking
        Route::get('/live-tracking', [\App\Http\Controllers\AssetTrackingController::class, 'index'])->name('live-tracking');
        Route::get('/api/live-tracking/poll', [\App\Http\Controllers\AssetTrackingController::class, 'poll'])->name('live-tracking.poll');
        Route::get('/api/live-tracking/history', [\App\Http\Controllers\AssetTrackingController::class, 'history'])->name('live-tracking.history');
        Route::get('/api/live-tracking/report', [\App\Http\Controllers\AssetTrackingController::class, 'report'])->name('live-tracking.report');
        Route::post('/live-tracking/checkout', [\App\Http\Controllers\AssetTrackingController::class, 'checkout'])->name('live-tracking.checkout');
        Route::patch('/live-tracking/{assignment}/checkin', [\App\Http\Controllers\AssetTrackingController::class, 'checkin'])->name('live-tracking.checkin');
    });

    // ── Geographic & Mapping (Asset Inventory permission reused) 
    Route::middleware(['permission:module.asset-inventory'])->group(function () {
        Route::get('/geographic-view', [\App\Http\Controllers\MappingController::class, 'geographicView'])->name('geographic-view');
        Route::patch('/sites/{site}/location', [\App\Http\Controllers\MappingController::class, 'updateSiteLocation'])->name('sites.update-location');
        Route::get('/mapping/floor-plans', [\App\Http\Controllers\MappingController::class, 'floorPlans'])->name('mapping.floor-plans');


    });

    // ── Master Data 
    Route::middleware(['permission:module.master-data'])->group(function () {
        Route::get('/master-data', [\App\Http\Controllers\MasterDataController::class, 'index'])->name('master-data');

        Route::post('/master-data/categories', [\App\Http\Controllers\MasterDataController::class, 'storeCategory'])->name('categories.store');
        Route::put('/master-data/categories/{id}', [\App\Http\Controllers\MasterDataController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/master-data/categories/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroyCategory'])->name('categories.destroy');

        Route::post('/master-data/types', [\App\Http\Controllers\MasterDataController::class, 'storeType'])->name('types.store');
        Route::put('/master-data/types/{id}', [\App\Http\Controllers\MasterDataController::class, 'updateType'])->name('types.update');
        Route::delete('/master-data/types/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroyType'])->name('types.destroy');

        Route::post('/master-data/sites', [\App\Http\Controllers\MasterDataController::class, 'storeSite'])->name('sites.store');
        Route::put('/master-data/sites/{id}', [\App\Http\Controllers\MasterDataController::class, 'updateSite'])->name('sites.update');
        Route::delete('/master-data/sites/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroySite'])->name('sites.destroy');

        Route::post('/master-data/vendors', [\App\Http\Controllers\MasterDataController::class, 'storeVendor'])->name('vendors.store.master');
        Route::put('/master-data/vendors/{id}', [\App\Http\Controllers\MasterDataController::class, 'updateVendor'])->name('vendors.update.master');
        Route::delete('/master-data/vendors/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroyVendor'])->name('vendors.destroy.master');

        // Vendor dedicated pages
        Route::resource('vendors', \App\Http\Controllers\VendorController::class);
    });

    // ── Multi-Site Management ────────────────────────────────────────────────
    Route::middleware(['permission:module.multi-site'])->group(function () {
        Route::get('/multi-site/tracking', [\App\Http\Controllers\MultiSiteController::class, 'tracking'])->name('multi-site.tracking');
        Route::get('/multi-site/dashboards', [\App\Http\Controllers\MultiSiteController::class, 'dashboards'])->name('multi-site.dashboards');
        Route::get('/multi-site/transfers', [\App\Http\Controllers\MultiSiteController::class, 'transfers'])->name('multi-site.transfers');
        Route::get('/multi-site/access', [\App\Http\Controllers\MultiSiteController::class, 'access'])->name('multi-site.access');
    });

    // ── Operations & Maintenance ─────────────────────────────────────────────
    Route::middleware(['permission:module.operations'])->group(function () {
        Route::get('/operations-maintanance', [\App\Http\Controllers\OperationsController::class, 'dashboard'])->name('operations-maintenance');
        Route::get('/maintenance/scheduling', [\App\Http\Controllers\OperationsController::class, 'scheduling']);
        Route::get('/maintenance/work-orders', [\App\Http\Controllers\OperationsController::class, 'workOrders']);
        Route::post('/maintenance/work-orders', [\App\Http\Controllers\OperationsController::class, 'storeWorkOrder'])->name('maintenance.work-orders.store');
        Route::patch('/maintenance/work-orders/{id}/status', [\App\Http\Controllers\OperationsController::class, 'updateWorkOrderStatus'])->name('maintenance.work-orders.status');
        Route::get('/maintenance/history', [\App\Http\Controllers\OperationsController::class, 'history']);
        Route::get('/maintenance/parts', [\App\Http\Controllers\OperationsController::class, 'parts']);
        Route::post('/maintenance/parts', [\App\Http\Controllers\OperationsController::class, 'storePart'])->name('maintenance.parts.store');
        Route::put('/maintenance/parts/{id}', [\App\Http\Controllers\OperationsController::class, 'updatePart'])->name('maintenance.parts.update');
        Route::delete('/maintenance/parts/{id}', [\App\Http\Controllers\OperationsController::class, 'destroyPart'])->name('maintenance.parts.destroy');
        Route::get('/maintenance/technicians', [\App\Http\Controllers\OperationsController::class, 'technicians']);

        Route::get('/vendors/performance', [\App\Http\Controllers\OperationsController::class, 'performance']);
        Route::get('/vendors/alerts', [\App\Http\Controllers\OperationsController::class, 'alerts']);
        Route::get('/vendors/slas', [\App\Http\Controllers\OperationsController::class, 'slas']);
        Route::get('/vendors/po', [\App\Http\Controllers\OperationsController::class, 'po']);
        Route::get('/vendors/portal', [\App\Http\Controllers\OperationsController::class, 'portal']);

        Route::get('/lifecycle/status', [\App\Http\Controllers\AssetLifecycleController::class, 'status']);
        Route::get('/lifecycle/warranty', [\App\Http\Controllers\AssetLifecycleController::class, 'warranty']);
        Route::get('/lifecycle/health', [\App\Http\Controllers\AssetLifecycleController::class, 'health']);
        Route::get('/lifecycle/audit', [\App\Http\Controllers\AssetLifecycleController::class, 'audit']);
    });

    // ── Analytics & Reporting ────────────────────────────────────────────────
    Route::middleware(['permission:module.analytics'])->group(function () {
        Route::get('/analytics/utilization', [\App\Http\Controllers\AnalyticsController::class, 'utilization']);
        Route::get('/analytics/costs', [\App\Http\Controllers\AnalyticsController::class, 'costs']);
        Route::get('/analytics/availability', [\App\Http\Controllers\AnalyticsController::class, 'availability']);
        Route::get('/analytics/compliance', [\App\Http\Controllers\AnalyticsController::class, 'compliance']);
        Route::get('/analytics/predictive', [\App\Http\Controllers\AnalyticsController::class, 'predictive']);
        Route::get('/analytics/heatmaps', [\App\Http\Controllers\AnalyticsController::class, 'heatmaps']);
    });

    // ── Financial Management ─────────────────────────────────────────────────
    Route::middleware(['permission:module.finance'])->group(function () {
        Route::get('/finance/valuation', [\App\Http\Controllers\FinanceController::class, 'valuation']);
        Route::get('/finance/budgets', [\App\Http\Controllers\FinanceController::class, 'budgets']);
        Route::get('/finance/costs', [\App\Http\Controllers\FinanceController::class, 'costs']);
        Route::get('/finance/requisitions', [\App\Http\Controllers\FinanceController::class, 'requisitions']);
        Route::get('/finance/insurance', [\App\Http\Controllers\FinanceController::class, 'insurance']);
    });

    // ── Document Management ──────────────────────────────────────────────────
    Route::middleware(['permission:module.documents'])->group(function () {
        Route::get('/documents/assets', [\App\Http\Controllers\DocumentManagementController::class, 'assets']);
        Route::get('/documents/maintenance', [\App\Http\Controllers\DocumentManagementController::class, 'maintenance']);
        Route::get('/documents/contracts', [\App\Http\Controllers\DocumentManagementController::class, 'contracts']);
        Route::get('/documents/versions', [\App\Http\Controllers\DocumentManagementController::class, 'versions']);
        Route::get('/documents/alerts', [\App\Http\Controllers\DocumentManagementController::class, 'alerts']);
    });

    // ── Advanced Features ─────────────────────────────────────────────────────


    // ── System Settings (Admin-level) ─────────────────────────────────────────
    Route::middleware(['permission:module.system-settings'])->group(function () {
        Route::get('/security/logs', [\App\Http\Controllers\SecurityController::class, 'logs']);
        Route::get('/security/roles', [\App\Http\Controllers\RoleAccessController::class, 'index'])->name('roles.index');
        Route::post('/security/roles/matrix', [\App\Http\Controllers\RoleAccessController::class, 'saveMatrix'])->name('roles.save-matrix');
        // User Management
        Route::resource('users', \App\Http\Controllers\UserController::class);
        Route::patch('/users/{user}/toggle-active', [\App\Http\Controllers\UserController::class, 'toggleActive'])->name('users.toggle-active');

        // Recycle Bin
        Route::get('/security/recycle-bin', [\App\Http\Controllers\RecycleBinController::class, 'index'])->name('recycle-bin.index');
        Route::post('/security/recycle-bin/{id}/restore', [\App\Http\Controllers\RecycleBinController::class, 'restore'])->name('recycle-bin.restore');
        Route::delete('/security/recycle-bin/{id}', [\App\Http\Controllers\RecycleBinController::class, 'forceDelete'])->name('recycle-bin.force-delete');
    });

});

require __DIR__.'/settings.php';