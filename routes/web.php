<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'nova-ams', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Nova AMS');

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Technician Dashboard
    Route::get('/technician/dashboard', [\App\Http\Controllers\TechnicianController::class, 'dashboard'])->name('technician.dashboard');

    // Technician Management (Admin & Site Manager)
    Route::prefix('technicians')->group(function () {
        Route::get('/', [\App\Http\Controllers\TechnicianManagementController::class, 'index'])->name('technicians.index');
        Route::post('/', [\App\Http\Controllers\TechnicianManagementController::class, 'store'])->name('technicians.store');
        Route::put('/{id}', [\App\Http\Controllers\TechnicianManagementController::class, 'update'])->name('technicians.update');
        Route::delete('/{id}', [\App\Http\Controllers\TechnicianManagementController::class, 'destroy'])->name('technicians.destroy');
        Route::post('/{id}/toggle-active', [\App\Http\Controllers\TechnicianManagementController::class, 'toggleActive'])->name('technicians.toggle-active');
        Route::get('/export', [\App\Http\Controllers\TechnicianManagementController::class, 'export'])->name('technicians.export');
    });

    // Asset Requests (User)
    Route::get('/requests', [\App\Http\Controllers\AssetRequestController::class, 'index'])->name('requests.index');
    Route::get('/requests/create', [\App\Http\Controllers\AssetRequestController::class, 'create'])->name('requests.create');
    Route::post('/requests', [\App\Http\Controllers\AssetRequestController::class, 'store'])->name('requests.store');
    Route::post('/requests/{id}/cancel', [\App\Http\Controllers\AssetRequestController::class, 'cancel'])->name('requests.cancel');

    // Asset Requests (Admin)
    Route::get('/requests/admin', [\App\Http\Controllers\AssetRequestController::class, 'adminIndex'])->name('requests.admin');
    Route::get('/requests/{id}', [\App\Http\Controllers\AssetRequestController::class, 'show'])->name('requests.show');
    Route::post('/requests/{id}/approve', [\App\Http\Controllers\AssetRequestController::class, 'approve'])->name('requests.approve');
    Route::post('/requests/{id}/reject', [\App\Http\Controllers\AssetRequestController::class, 'reject'])->name('requests.reject');
    Route::post('/requests/{id}/return', [\App\Http\Controllers\AssetRequestController::class, 'markReturned'])->name('requests.return');
    Route::post('/requests/batch-approve', [\App\Http\Controllers\AssetRequestController::class, 'batchApprove'])->name('requests.batch-approve');
    Route::post('/requests/batch-reject', [\App\Http\Controllers\AssetRequestController::class, 'batchReject'])->name('requests.batch-reject');

    // Asset Loans
    Route::prefix('asset-loans')->group(function () {
        Route::get('/', [\App\Http\Controllers\AssetLoanController::class, 'index'])->name('asset-loans.index');
        Route::get('/create', [\App\Http\Controllers\AssetLoanController::class, 'create'])->name('asset-loans.create');
        Route::post('/', [\App\Http\Controllers\AssetLoanController::class, 'store'])->name('asset-loans.store');
    });

    // Check Out / Check In (Blocked for Admin users)
    Route::middleware(['restrict.admin'])->group(function () {
        Route::get('/checkout', [\App\Http\Controllers\CheckOutInController::class, 'index'])->name('checkout.index');
        Route::get('/checkout/new', [\App\Http\Controllers\CheckOutInController::class, 'create'])->name('checkout.create');
        Route::post('/checkout', [\App\Http\Controllers\CheckOutInController::class, 'store'])->name('checkout.store');
        Route::post('/checkout/{id}/checkin', [\App\Http\Controllers\CheckOutInController::class, 'checkin'])->name('checkout.checkin');
    });

    // Transactions (User - Blocked for Admin users)
    Route::middleware(['restrict.admin'])->group(function () {
        Route::get('/transactions', [\App\Http\Controllers\TransactionController::class, 'index'])->name('transactions.index');
    });

    // Support Tickets
    Route::get('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'index'])->name('support.tickets');
    Route::post('/support/tickets', [\App\Http\Controllers\SupportTicketController::class, 'store'])->name('support.tickets.store');
    Route::get('/support/tickets/{ticket}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets/{ticket}/message', [\App\Http\Controllers\SupportTicketController::class, 'message'])->name('support.tickets.message');
    Route::patch('/support/tickets/{ticket}/status', [\App\Http\Controllers\SupportTicketController::class, 'updateStatus'])->name('support.tickets.status');

    // System Monitoring API
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

    Route::get('/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/api/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/api/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // Asset Inventory Module
    Route::middleware(['permission:module.asset-inventory'])->group(function () {
        Route::get('/asset-inventory', [\App\Http\Controllers\AssetController::class, 'inventory'])->name('asset-inventory');
        Route::post('assets/import-bulk', [\App\Http\Controllers\AssetController::class, 'importBulk'])->name('assets.import');
        Route::get('/assets/export', [\App\Http\Controllers\AssetController::class, 'exportCsv'])->name('assets.export');
        Route::patch('assets/{asset}/status', [\App\Http\Controllers\AssetController::class, 'updateStatus'])->name('assets.status');
        Route::resource('assets', \App\Http\Controllers\AssetController::class);
        Route::get('asset-statuses', [\App\Http\Controllers\AssetController::class, 'statuses'])->name('asset-statuses');
        Route::post('assets/bulk-update-status', [\App\Http\Controllers\AssetController::class, 'bulkUpdateStatus'])->name('assets.bulk-status');

        // Asset Registration Workflows
        Route::get('/assets/scan', function () {
            return Inertia::render('Assets/Scan', [
                'site_id' => request()->query('site_id')
            ]);
        })->name('assets.scan');

        Route::get('/assets/upload', function () {
            return Inertia::render('Assets/Upload', [
                'site_id' => request()->query('site_id'),
                'sites' => \App\Models\Site::all()
            ]);
        })->name('assets.upload');

        // QR/Barcode Scanning routes
        Route::post('/api/assets/scan', [\App\Http\Controllers\AssetController::class, 'processScan']);
        Route::post('/api/assets/scan-bulk', [\App\Http\Controllers\AssetController::class, 'processBulkScan']);
        Route::get('/api/assets/lookup/{scannedValue}', [\App\Http\Controllers\AssetController::class, 'lookupAsset']);
        
        // Software Licenses Module
        Route::get('/licenses/usage-report', [\App\Http\Controllers\LicenseController::class, 'usageReport'])->name('licenses.usage-report');
        Route::get('/licenses/renewals', [\App\Http\Controllers\LicenseController::class, 'renewals'])->name('licenses.renewals');
        Route::post('/licenses/seats/{seat}/checkout', [\App\Http\Controllers\LicenseController::class, 'checkout'])->name('licenses.seats.checkout');
        Route::post('/licenses/seats/{seat}/checkin', [\App\Http\Controllers\LicenseController::class, 'checkin'])->name('licenses.seats.checkin');
        Route::post('/licenses/{license}/record-renewal', [\App\Http\Controllers\LicenseController::class, 'recordRenewal'])->name('licenses.record-renewal');
        Route::get('/licenses/trash', [\App\Http\Controllers\LicenseController::class, 'trash'])->name('licenses.trash');
        Route::post('/licenses/{id}/restore', [\App\Http\Controllers\LicenseController::class, 'restore'])->name('licenses.restore');
        Route::delete('/licenses/{id}/force', [\App\Http\Controllers\LicenseController::class, 'forceDelete'])->name('licenses.force-delete');
        Route::resource('licenses', \App\Http\Controllers\LicenseController::class);

        Route::get('/live-tracking', [\App\Http\Controllers\AssetTrackingController::class, 'index'])->name('live-tracking');
        Route::get('/api/live-tracking/poll', [\App\Http\Controllers\AssetTrackingController::class, 'poll'])->name('live-tracking.poll');
        Route::get('/api/live-tracking/history', [\App\Http\Controllers\AssetTrackingController::class, 'history'])->name('live-tracking.history');
        Route::get('/api/live-tracking/report', [\App\Http\Controllers\AssetTrackingController::class, 'report'])->name('live-tracking.report');
        Route::post('/live-tracking/checkout', [\App\Http\Controllers\AssetTrackingController::class, 'checkout'])->name('live-tracking.checkout');
        Route::patch('/live-tracking/{assignment}/checkin', [\App\Http\Controllers\AssetTrackingController::class, 'checkin'])->name('live-tracking.checkin');
        Route::post('/live-tracking/{assignment}/send-reminder', [\App\Http\Controllers\AssetTrackingController::class, 'sendReminder'])->name('live-tracking.send-reminder');
        Route::post('/live-tracking/bulk-reminders', [\App\Http\Controllers\AssetTrackingController::class, 'sendBulkReminders'])->name('live-tracking.bulk-reminders');

        // Asset Withdrawals Module
        Route::prefix('withdrawals')->group(function () {
            Route::get('/', [\App\Http\Controllers\WithdrawalController::class, 'index'])->name('withdrawals.index');
            Route::get('/create', [\App\Http\Controllers\WithdrawalController::class, 'create'])->name('withdrawals.create');
            Route::post('/', [\App\Http\Controllers\WithdrawalController::class, 'store'])->name('withdrawals.store');
            Route::get('/{withdrawal}', [\App\Http\Controllers\WithdrawalController::class, 'show'])->name('withdrawals.show');
            Route::put('/{withdrawal}', [\App\Http\Controllers\WithdrawalController::class, 'update'])->name('withdrawals.update');
            Route::delete('/{withdrawal}', [\App\Http\Controllers\WithdrawalController::class, 'destroy'])->name('withdrawals.destroy');
            Route::post('/{withdrawal}/return', [\App\Http\Controllers\WithdrawalController::class, 'returnAsset'])->name('withdrawals.return');
            Route::post('/{withdrawal}/approve', [\App\Http\Controllers\WithdrawalController::class, 'approve'])->name('withdrawals.approve');
            Route::post('/{withdrawal}/reject', [\App\Http\Controllers\WithdrawalController::class, 'reject'])->name('withdrawals.reject');
            Route::get('/dashboard', [\App\Http\Controllers\WithdrawalController::class, 'dashboard'])->name('withdrawals.dashboard');
        });
    });

    // Master Data Module
    Route::middleware(['permission:module.master-data'])->group(function () {
        Route::get('/master-data', [\App\Http\Controllers\MasterDataController::class, 'index'])->name('master-data');

        Route::prefix('master-data/table-configurations')->group(function () {
            Route::get('/', [\App\Http\Controllers\TableConfigurationController::class, 'index'])->name('table-configurations.index');
            Route::get('/create', [\App\Http\Controllers\TableConfigurationController::class, 'create'])->name('table-configurations.create');
            Route::post('/', [\App\Http\Controllers\TableConfigurationController::class, 'store'])->name('table-configurations.store');
            Route::post('/generate-from-headers', [\App\Http\Controllers\TableConfigurationController::class, 'generateFromHeaders'])->name('table-configurations.generate-from-headers');
            Route::post('/batch-delete', [\App\Http\Controllers\TableConfigurationController::class, 'batchDelete'])->name('table-configurations.batch-delete');
            Route::post('/batch-update', [\App\Http\Controllers\TableConfigurationController::class, 'batchUpdate'])->name('table-configurations.batch-update');
            Route::get('/{tableConfiguration}', [\App\Http\Controllers\TableConfigurationController::class, 'show'])->name('table-configurations.show');
            Route::get('/{tableConfiguration}/edit', [\App\Http\Controllers\TableConfigurationController::class, 'edit'])->name('table-configurations.edit');
            Route::put('/{tableConfiguration}', [\App\Http\Controllers\TableConfigurationController::class, 'update'])->name('table-configurations.update');
            Route::delete('/{tableConfiguration}', [\App\Http\Controllers\TableConfigurationController::class, 'destroy'])->name('table-configurations.destroy');
            Route::post('/update-order', [\App\Http\Controllers\TableConfigurationController::class, 'updateOrder'])->name('table-configurations.update-order');
            Route::post('/{tableConfiguration}/duplicate', [\App\Http\Controllers\TableConfigurationController::class, 'duplicate'])->name('table-configurations.duplicate');
            Route::post('/reset-to-default/{tableName}', [\App\Http\Controllers\TableConfigurationController::class, 'resetToDefault'])->name('table-configurations.reset');
            Route::post('/delete-table/{tableName}', [\App\Http\Controllers\TableConfigurationController::class, 'deleteTable'])->name('table-configurations.delete-table');
        });

        // Resourceful Master Data sub-controllers
        Route::resource('/master-data/categories', \App\Http\Controllers\MasterData\CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/types', \App\Http\Controllers\MasterData\TypeController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/sites', \App\Http\Controllers\MasterData\SiteController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/vendors', \App\Http\Controllers\MasterData\VendorController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/custom-types', \App\Http\Controllers\MasterData\CustomTypeController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/custom-columns', \App\Http\Controllers\MasterData\ColumnController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/custom-values', \App\Http\Controllers\MasterData\ValueController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/licenses', \App\Http\Controllers\MasterData\LicenseController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/asset-statuses', \App\Http\Controllers\MasterData\AssetStatusController::class)->only(['store', 'update', 'destroy']);
        Route::resource('/master-data/spare-part-categories', \App\Http\Controllers\MasterData\SparePartCategoryController::class)->only(['store', 'update', 'destroy']);

        Route::post('/master-data/custom-values/batch-delete', [\App\Http\Controllers\MasterData\ValueController::class, 'batchDelete'])->name('custom-values.batch-delete');
        Route::post('/master-data/custom-values/batch-update', [\App\Http\Controllers\MasterData\ValueController::class, 'batchUpdate'])->name('custom-values.batch-update');
    });

    // Multi-Site Module
    Route::middleware(['permission:module.multi-site'])->group(function () {
        Route::get('/multi-site/tracking', [\App\Http\Controllers\MultiSiteController::class, 'tracking'])->name('multi-site.tracking');
        Route::get('/multi-site/dashboards', [\App\Http\Controllers\MultiSiteController::class, 'dashboards'])->name('multi-site.dashboards');
        Route::get('/multi-site/transfers', [\App\Http\Controllers\MultiSiteController::class, 'transfers'])->name('multi-site.transfers');
        Route::post('/multi-site/transfers', [\App\Http\Controllers\MultiSiteController::class, 'storeTransfer'])->name('multi-site.transfers.store');
        Route::patch('/multi-site/transfers/{id}/status', [\App\Http\Controllers\MultiSiteController::class, 'updateTransferStatus'])->name('multi-site.transfers.status');
        Route::get('/multi-site/access', [\App\Http\Controllers\MultiSiteController::class, 'access'])->name('multi-site.access');
    });

    // Operations Module
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

        // Spare Parts Module
        Route::prefix('spare-parts')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\SparePartController::class, 'dashboard'])->name('spare-parts.dashboard');
            Route::get('/', [\App\Http\Controllers\SparePartController::class, 'index'])->name('spare-parts.index');
            Route::post('/', [\App\Http\Controllers\SparePartController::class, 'store'])->name('spare-parts.store');
            Route::put('/{sparePart}', [\App\Http\Controllers\SparePartController::class, 'update'])->name('spare-parts.update');
            Route::delete('/{sparePart}', [\App\Http\Controllers\SparePartController::class, 'destroy'])->name('spare-parts.destroy');
            Route::post('/{sparePart}/checkout', [\App\Http\Controllers\SparePartController::class, 'checkout'])->name('spare-parts.checkout');
            Route::post('/checkouts/{checkout}/return', [\App\Http\Controllers\SparePartController::class, 'returnCheckout'])->name('spare-parts.return');
            Route::get('/export', [\App\Http\Controllers\SparePartController::class, 'exportCsv'])->name('spare-parts.export');
            Route::post('/import-bulk', [\App\Http\Controllers\SparePartController::class, 'importBulk'])->name('spare-parts.import-bulk');
        });
        Route::get('/vendors/slas', [\App\Http\Controllers\OperationsController::class, 'slas']);
        Route::get('/vendors/po', [\App\Http\Controllers\OperationsController::class, 'po']);
        Route::get('/vendors/portal', [\App\Http\Controllers\OperationsController::class, 'portal']);

    });

    // Documents Module
    Route::middleware(['permission:module.documents'])->group(function () {
        Route::get('/documents/assets', [\App\Http\Controllers\DocumentManagementController::class, 'assets']);
        Route::get('/documents/maintenance', [\App\Http\Controllers\DocumentManagementController::class, 'maintenance']);
        Route::get('/documents/contracts', [\App\Http\Controllers\DocumentManagementController::class, 'contracts']);
        Route::get('/documents/versions', [\App\Http\Controllers\DocumentManagementController::class, 'versions']);
        Route::get('/documents/alerts', [\App\Http\Controllers\DocumentManagementController::class, 'alerts']);
    });

    // System Settings Module
    Route::middleware(['permission:module.system-settings'])->group(function () {
        Route::get('/security/logs', [\App\Http\Controllers\SecurityController::class, 'logs']);
        Route::get('/security/roles', [\App\Http\Controllers\RoleAccessController::class, 'index'])->name('roles.index');
        Route::post('/security/roles/matrix', [\App\Http\Controllers\RoleAccessController::class, 'saveMatrix'])->name('roles.save-matrix');
        Route::resource('users', \App\Http\Controllers\UserController::class);
        Route::patch('/users/{user}/toggle-active', [\App\Http\Controllers\UserController::class, 'toggleActive'])->name('users.toggle-active');

        // Recycle Bin
        Route::get('/security/recycle-bin', [\App\Http\Controllers\RecycleBinController::class, 'index'])->name('recycle-bin.index');
        Route::post('/security/recycle-bin/{id}/restore', [\App\Http\Controllers\RecycleBinController::class, 'restore'])->name('recycle-bin.restore');
        Route::delete('/security/recycle-bin/{id}', [\App\Http\Controllers\RecycleBinController::class, 'forceDelete'])->name('recycle-bin.force-delete');

        // Admin Site Management Routes
        Route::prefix('admin')->group(function () {
            Route::get('/sites', [\App\Http\Controllers\AdminSiteManagementController::class, 'index'])->name('admin.sites');
            Route::post('/sites', [\App\Http\Controllers\AdminSiteManagementController::class, 'store'])->name('admin.sites.store');
            Route::put('/sites/{id}', [\App\Http\Controllers\AdminSiteManagementController::class, 'update'])->name('admin.sites.update');
            Route::delete('/sites/{id}', [\App\Http\Controllers\AdminSiteManagementController::class, 'destroy'])->name('admin.sites.destroy');
            Route::get('/sites/{id}/users', [\App\Http\Controllers\AdminSiteManagementController::class, 'getSiteUsers'])->name('admin.sites.users');
            Route::post('/sites/{id}/admin', [\App\Http\Controllers\AdminSiteManagementController::class, 'assignSiteAdmin'])->name('admin.sites.assign-admin');

            // Page Permissions Management Routes
            Route::get('/page-permissions', [\App\Http\Controllers\PagePermissionController::class, 'index'])->name('admin.page-permissions');
            Route::get('/page-permissions/user/{user}', [\App\Http\Controllers\PagePermissionController::class, 'getUserPermissions'])->name('admin.page-permissions.user');
            Route::post('/page-permissions/user/{user}', [\App\Http\Controllers\PagePermissionController::class, 'updateUserPermissions'])->name('admin.page-permissions.user.update');
            Route::post('/page-permissions/bulk', [\App\Http\Controllers\PagePermissionController::class, 'bulkUpdatePermissions'])->name('admin.page-permissions.bulk');
            Route::post('/page-permissions/copy', [\App\Http\Controllers\PagePermissionController::class, 'copyPermissions'])->name('admin.page-permissions.copy');
            Route::get('/page-permissions/stats', [\App\Http\Controllers\PagePermissionController::class, 'getStatistics'])->name('admin.page-permissions.stats');
        });

        // Recycle bin bulk operations
        Route::post('/api/recycle-bin/bulk-restore', function (\Illuminate\Http\Request $request) {
            $type = $request->input('type');
            $ids = $request->input('ids');

            if (empty($ids)) {
                return response()->json(['message' => 'No records selected.'], 400);
            }

            $count = 0;
            switch ($type) {
                case 'assets':
                    $count = \App\Models\Asset::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
                case 'users':
                    $count = \App\Models\User::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
                case 'vendors':
                    $count = \App\Models\Vendor::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
                case 'asset_categories':
                    $count = \App\Models\AssetCategory::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
                case 'spareparts':
                    $count = \App\Models\SparePart::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
            }

            return response()->json(['message' => "Successfully restored $count records!", 'count' => $count]);
        });

        Route::post('/api/recycle-bin/bulk-delete', function (\Illuminate\Http\Request $request) {
            $type = $request->input('type');
            $ids = $request->input('ids');

            if (empty($ids)) {
                return response()->json(['message' => 'No records selected.'], 400);
            }

            $count = 0;
            switch ($type) {
                case 'assets':
                    $count = \App\Models\Asset::onlyTrashed()->whereIn('id', $ids)->forceDelete();
                    break;
                case 'users':
                    $count = \App\Models\User::onlyTrashed()->whereIn('id', $ids)->forceDelete();
                    break;
                case 'vendors':
                    $count = \App\Models\Vendor::onlyTrashed()->whereIn('id', $ids)->forceDelete();
                    break;
                case 'asset_categories':
                    $count = \App\Models\AssetCategory::onlyTrashed()->whereIn('id', $ids)->forceDelete();
                    break;
                case 'spareparts':
                    $count = \App\Models\SparePart::onlyTrashed()->whereIn('id', $ids)->forceDelete();
                    break;
            }

            return response()->json(['message' => "Successfully deleted $count records!", 'count' => $count]);
        });

        // Settings CRUD Routes
        Route::get('/settings/custom-fields', [\App\Http\Controllers\SettingsController::class, 'customFields'])->name('settings.custom-fields');
        Route::post('/settings/custom-fields', [\App\Http\Controllers\SettingsController::class, 'storeCustomField'])->name('settings.custom-fields.store');
        Route::put('/settings/custom-fields/{id}', [\App\Http\Controllers\SettingsController::class, 'updateCustomField'])->name('settings.custom-fields.update');
        Route::delete('/settings/custom-fields/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyCustomField'])->name('settings.custom-fields.destroy');

        Route::get('/settings/status-labels', [\App\Http\Controllers\SettingsController::class, 'statusLabels'])->name('settings.status-labels');
        Route::post('/settings/status-labels', [\App\Http\Controllers\SettingsController::class, 'storeStatusLabel'])->name('settings.status-labels.store');
        Route::put('/settings/status-labels/{id}', [\App\Http\Controllers\SettingsController::class, 'updateStatusLabel'])->name('settings.status-labels.update');
        Route::delete('/settings/status-labels/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyStatusLabel'])->name('settings.status-labels.destroy');

        Route::get('/settings/asset-models', [\App\Http\Controllers\SettingsController::class, 'assetModels'])->name('settings.asset-models');
        Route::post('/settings/asset-models', [\App\Http\Controllers\SettingsController::class, 'storeAssetModel'])->name('settings.asset-models.store');
        Route::put('/settings/asset-models/{id}', [\App\Http\Controllers\SettingsController::class, 'updateAssetModel'])->name('settings.asset-models.update');
        Route::delete('/settings/asset-models/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyAssetModel'])->name('settings.asset-models.destroy');

        Route::get('/settings/categories', [\App\Http\Controllers\SettingsController::class, 'categories'])->name('settings.categories');
        Route::post('/settings/categories', [\App\Http\Controllers\SettingsController::class, 'storeCategory'])->name('settings.categories.store');
        Route::put('/settings/categories/{id}', [\App\Http\Controllers\SettingsController::class, 'updateCategory'])->name('settings.categories.update');
        Route::delete('/settings/categories/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyCategory'])->name('settings.categories.destroy');

        Route::get('/settings/manufacturers', [\App\Http\Controllers\SettingsController::class, 'manufacturers'])->name('settings.manufacturers');
        Route::post('/settings/manufacturers', [\App\Http\Controllers\SettingsController::class, 'storeManufacturer'])->name('settings.manufacturers.store');
        Route::put('/settings/manufacturers/{id}', [\App\Http\Controllers\SettingsController::class, 'updateManufacturer'])->name('settings.manufacturers.update');
        Route::delete('/settings/manufacturers/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyManufacturer'])->name('settings.manufacturers.destroy');

        Route::get('/settings/suppliers', [\App\Http\Controllers\SettingsController::class, 'suppliers'])->name('settings.suppliers');
        Route::post('/settings/suppliers', [\App\Http\Controllers\SettingsController::class, 'storeSupplier'])->name('settings.suppliers.store');
        Route::put('/settings/suppliers/{id}', [\App\Http\Controllers\SettingsController::class, 'updateSupplier'])->name('settings.suppliers.update');
        Route::delete('/settings/suppliers/{id}', [\App\Http\Controllers\SettingsController::class, 'destroySupplier'])->name('settings.suppliers.destroy');
        Route::post('/settings/vendors', [\App\Http\Controllers\SettingsController::class, 'storeVendor'])->name('settings.vendors.store');
        Route::put('/settings/vendors/{id}', [\App\Http\Controllers\SettingsController::class, 'updateVendor'])->name('settings.vendors.update');
        Route::delete('/settings/vendors/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyVendor'])->name('settings.vendors.destroy');

        Route::get('/settings/departments', [\App\Http\Controllers\SettingsController::class, 'departments'])->name('settings.departments');
        Route::post('/settings/departments', [\App\Http\Controllers\SettingsController::class, 'storeDepartment'])->name('settings.departments.store');
        Route::put('/settings/departments/{id}', [\App\Http\Controllers\SettingsController::class, 'updateDepartment'])->name('settings.departments.update');
        Route::delete('/settings/departments/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyDepartment'])->name('settings.departments.destroy');

        Route::get('/settings/locations', [\App\Http\Controllers\SettingsController::class, 'locations'])->name('settings.locations');
        Route::post('/settings/locations', [\App\Http\Controllers\SettingsController::class, 'storeLocation'])->name('settings.locations.store');
        Route::put('/settings/locations/{id}', [\App\Http\Controllers\SettingsController::class, 'updateLocation'])->name('settings.locations.update');
        Route::delete('/settings/locations/{id}', [\App\Http\Controllers\SettingsController::class, 'destroyLocation'])->name('settings.locations.destroy');
    });

    // Quick creation APIs for inline forms
    Route::post('/api/quick/vendors', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate(['name' => 'required|string|unique:vendors,name']);
        $vendor = \App\Models\Vendor::create($validated);
        return response()->json($vendor);
    });

    Route::post('/api/quick/types', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate(['name' => 'required|string|unique:asset_types,name']);
        $type = \App\Models\AssetType::create($validated);
        return response()->json($type);
    });

    Route::post('/api/quick/status-labels', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|unique:status_labels,name',
            'type' => 'nullable|string'
        ]);
        $status = \App\Models\StatusLabel::create([
            'name' => $validated['name'],
            'type' => $validated['type'] ?? 'deployable'
        ]);
        return response()->json($status);
    });

    Route::post('/api/quick/sites', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate(['name' => 'required|string|unique:sites,name']);
        $site = \App\Models\Site::create([
            'name' => $validated['name'],
            'code' => strtoupper(substr(trim($validated['name']), 0, 3)) . '-' . rand(1000, 9999)
        ]);
        return response()->json($site);
    });

    Route::post('/api/quick/locations', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate(['name' => 'required|string|unique:locations,name']);
        $location = \App\Models\Location::create($validated);
        return response()->json($location);
    });

    Route::post('/api/quick/suppliers', function (\Illuminate\Http\Request $request) {
        $validated = $request->validate(['name' => 'required|string|unique:suppliers,name']);
        $supplier = \App\Models\Supplier::create($validated);
        return response()->json($supplier);
    });

    Route::post('/api/quick/bulk-import', function (\Illuminate\Http\Request $request) {
        if (!auth()->user() || !auth()->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can perform bulk actions.'], 403);
        }

        $type = $request->input('type');
        $rows = $request->input('rows');
        
        if (empty($rows)) {
            return response()->json(['message' => 'No rows to import.'], 400);
        }
        
        $count = 0;
        foreach ($rows as $row) {
            $val = function($keys, $default = null) use ($row) {
                foreach ($row as $k => $v) {
                    $normK = strtolower(trim(str_replace(['_', ' '], '', $k)));
                    foreach ((array)$keys as $searchKey) {
                        $normSearch = strtolower(trim(str_replace(['_', ' '], '', $searchKey)));
                        if ($normK === $normSearch) {
                            return $v;
                        }
                    }
                }
                return $default;
            };

            switch ($type) {
                case 'categories':
                    $name = $val(['name', 'categoryname', 'tajuk', 'category']);
                    if ($name) {
                        \App\Models\AssetCategory::firstOrCreate(
                            ['name' => trim($name)],
                            ['description' => trim($val(['description', 'desc', 'keterangan'], ''))]
                        );
                        $count++;
                    }
                    break;
                case 'departments':
                    $name = $val(['name', 'departmentname', 'jabatan', 'department']);
                    if ($name) {
                        \App\Models\Department::firstOrCreate(
                            ['name' => trim($name)],
                            ['notes' => trim($val(['notes', 'catatan', 'description'], ''))]
                        );
                        $count++;
                    }
                    break;
                case 'suppliers':
                    $name = $val(['name', 'suppliername', 'pembekal', 'supplier']);
                    if ($name) {
                        \App\Models\Supplier::firstOrCreate(
                            ['name' => trim($name)],
                            [
                                'email' => trim($val(['email', 'emel'], '')),
                                'phone' => trim($val(['phone', 'tel', 'telefon'], '')),
                                'address' => trim($val(['address', 'alamat'], ''))
                            ]
                        );
                        $count++;
                    }
                    break;
                case 'locations':
                    $name = $val(['name', 'locationname', 'lokasi', 'location']);
                    if ($name) {
                        \App\Models\Location::firstOrCreate(
                            ['name' => trim($name)],
                            ['notes' => trim($val(['notes', 'catatan'], ''))]
                        );
                        $count++;
                    }
                    break;
                case 'manufacturers':
                    $name = $val(['name', 'manufacturername', 'pengilang', 'manufacturer']);
                    if ($name) {
                        \App\Models\Manufacturer::firstOrCreate(
                            ['name' => trim($name)],
                            ['notes' => trim($val(['notes', 'catatan'], ''))]
                        );
                        $count++;
                    }
                    break;
                case 'status-labels':
                    $name = $val(['name', 'statusname', 'label', 'status']);
                    if ($name) {
                        \App\Models\StatusLabel::firstOrCreate(
                            ['name' => trim($name)],
                            ['type' => trim($val(['type', 'status_type'], 'deployable'))]
                        );
                        $count++;
                    }
                    break;
                case 'asset-models':
                    $name = $val(['name', 'modelname', 'produk', 'model']);
                    if ($name) {
                        $mfgName = $val(['manufacturer', 'brand', 'pengilang']);
                        $mfgId = null;
                        if ($mfgName) {
                            $mfg = \App\Models\Manufacturer::firstOrCreate(['name' => trim($mfgName)]);
                            $mfgId = $mfg->id;
                        }
                        $catName = $val(['category', 'kategori']);
                        $catId = null;
                        if ($catName) {
                            $cat = \App\Models\AssetCategory::firstOrCreate(['name' => trim($catName)]);
                            $catId = $cat->id;
                        }

                        \App\Models\AssetModel::firstOrCreate(
                            ['name' => trim($name)],
                            [
                                'model_number' => trim($val(['model_number', 'modelno', 'nomor'], '')),
                                'manufacturer_id' => $mfgId,
                                'category_id' => $catId
                            ]
                        );
                        $count++;
                    }
                    break;
                case 'users':
                    $email = $val(['email', 'emel']);
                    $name = $val(['name', 'username', 'nama', 'user']);
                    if ($email && $name) {
                        $statusVal = trim($val(['status', 'keadaan', 'active', 'is_active'], 'active'));
                        $isActive = ($statusVal === 'active' || $statusVal === '1' || $statusVal === 'true' || $statusVal === true || $statusVal === 'yes');
                        $user = \App\Models\User::firstOrCreate(
                            ['email' => trim($email)],
                            [
                                'name' => trim($name),
                                'password' => bcrypt(trim($val(['password', 'katalaluan'], 'password123'))),
                                'is_active' => $isActive
                            ]
                        );
                        $count++;
                    }
                    break;
                case 'custom-fields':
                    $name = $val(['name', 'fieldname', 'field_name', 'nama']);
                    if ($name) {
                        \App\Models\CustomField::firstOrCreate(
                            ['name' => trim($name)],
                            [
                                'field_type' => trim($val(['field_type', 'type', 'jenis'], 'text')),
                                'default_value' => trim($val(['default_value', 'value', 'default'], ''))
                            ]
                        );
                        $count++;
                    }
                    break;
            }
        }
        
        return response()->json(['message' => "Successfully imported $count records!", 'count' => $count]);
    });

    Route::post('/api/quick/bulk-delete', function (\Illuminate\Http\Request $request) {
        if (!auth()->user() || !auth()->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can perform bulk actions.'], 403);
        }

        $type = $request->input('type');
        $ids = $request->input('ids');
        
        if (empty($ids)) {
            return response()->json(['message' => 'No records selected.'], 400);
        }

        $modelMap = [
            'assets' => \App\Models\Asset::class,
            'categories' => \App\Models\AssetCategory::class,
            'departments' => \App\Models\Department::class,
            'suppliers' => \App\Models\Supplier::class,
            'locations' => \App\Models\Location::class,
            'manufacturers' => \App\Models\Manufacturer::class,
            'status-labels' => \App\Models\StatusLabel::class,
            'asset-models' => \App\Models\AssetModel::class,
            'users' => \App\Models\User::class,
            'spare-parts' => \App\Models\SparePart::class,
            'work-orders' => \App\Models\WorkOrder::class,
            'licenses' => \App\Models\License::class,
            'custom-fields' => \App\Models\CustomField::class,
            'table-configurations' => \App\Models\TableConfiguration::class,
        ];

        $modelClass = $modelMap[$type] ?? null;

        if (!$modelClass) {
            // Try studly-case fallback
            $candidate = '\\App\\Models\\' . \Illuminate\Support\Str::studly(str_replace('-', '_', $type));
            if (class_exists($candidate)) {
                $modelClass = $candidate;
            }
        }

        if (!$modelClass) {
            return response()->json(['message' => "Unknown resource type: $type"], 400);
        }

        // Special handling: assets has a global scope that needs bypassing
        if ($type === 'assets') {
            $count = \App\Models\Asset::withoutGlobalScope('site_access')->whereIn('id', $ids)->forceDelete();
        } else {
            $instance = new $modelClass;
            $count = method_exists($instance, 'forceDelete')
                ? $modelClass::whereIn('id', $ids)->forceDelete()
                : $modelClass::whereIn('id', $ids)->delete();
        }

        if ($count === 0) {
            return response()->json(['message' => 'No records found to delete. The records may already be deleted.'], 404);
        }

        return response()->json(['message' => "Successfully deleted $count records!", 'count' => $count]);
    });

    Route::post('/api/quick/bulk-status', function (\Illuminate\Http\Request $request) {
        if (!auth()->user() || !auth()->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized. Only admins can perform bulk actions.'], 403);
        }

        $type = $request->input('type');
        $ids = $request->input('ids');
        $status = $request->input('status');
        $statusLabelId = $request->input('status_label_id');
        
        if (empty($ids)) {
            return response()->json(['message' => 'No records selected.'], 400);
        }

        $count = 0;
        switch ($type) {
            case 'assets':
                foreach (\App\Models\Asset::withoutGlobalScope('site_access')->whereIn('id', $ids)->cursor() as $asset) {
                    $asset->setField('status', $status);
                    $count++;
                }
                break;
            case 'work-orders':
                $count = \App\Models\WorkOrder::whereIn('id', $ids)->update(['status' => $status]);
                break;
            case 'users':
                $isActive = ($status === 'active' || $status === '1' || $status === true);
                $count = \App\Models\User::whereIn('id', $ids)->update(['is_active' => $isActive]);
                break;
        }

        return response()->json(['message' => "Successfully updated status of $count records!", 'count' => $count]);
    });

});

require __DIR__.'/settings.php';
