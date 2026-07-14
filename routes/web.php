<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'nova-ams', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('Nova AMS');

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Asset Requests (Admin/Manager)
    Route::middleware(['role:Admin|Manager'])->group(function () {
        Route::get('/requests/admin', [\App\Http\Controllers\AssetRequestController::class, 'adminIndex'])->name('requests.admin');
        Route::get('/requests/{id}', [\App\Http\Controllers\AssetRequestController::class, 'show'])->name('requests.show');
        Route::post('/requests/{id}/approve', [\App\Http\Controllers\AssetRequestController::class, 'approve'])->name('requests.approve');
        Route::post('/requests/{id}/reject', [\App\Http\Controllers\AssetRequestController::class, 'reject'])->name('requests.reject');
        Route::post('/requests/{id}/return', [\App\Http\Controllers\AssetRequestController::class, 'markReturned'])->name('requests.return');
        Route::post('/requests/batch-approve', [\App\Http\Controllers\AssetRequestController::class, 'batchApprove'])->name('requests.batch-approve');
        Route::post('/requests/batch-reject', [\App\Http\Controllers\AssetRequestController::class, 'batchReject'])->name('requests.batch-reject');
    });

    // Asset Loans
    Route::prefix('asset-loans')->group(function () {
        Route::get('/', [\App\Http\Controllers\AssetLoanController::class, 'index'])->name('asset-loans.index');
        Route::get('/create', [\App\Http\Controllers\AssetLoanController::class, 'create'])->name('asset-loans.create');
        Route::post('/', [\App\Http\Controllers\AssetLoanController::class, 'store'])->name('asset-loans.store');
        Route::post('/{loan}/return', [\App\Http\Controllers\AssetLoanController::class, 'returnLoan'])->name('asset-loans.return');
    });

    // Asset Inventory Module
    Route::get('/asset-inventory', [\App\Http\Controllers\AssetController::class, 'inventory'])->name('asset-inventory');

    Route::middleware(['permission:module.asset-inventory'])->group(function () {
        Route::post('assets/import-bulk', [\App\Http\Controllers\AssetController::class, 'importBulk'])->name('assets.import');
        Route::get('/assets/export', [\App\Http\Controllers\AssetController::class, 'exportCsv'])->name('assets.export');
        Route::patch('assets/{asset}/status', [\App\Http\Controllers\AssetController::class, 'updateStatus'])->name('assets.status');
        Route::post('assets/{asset}/image', [\App\Http\Controllers\AssetController::class, 'updateImage'])->name('assets.image');
        Route::resource('assets', \App\Http\Controllers\AssetController::class);
        Route::get('asset-statuses', [\App\Http\Controllers\AssetController::class, 'statuses'])->name('asset-statuses');
        Route::post('assets/bulk-update-status', [\App\Http\Controllers\AssetController::class, 'bulkUpdateStatus'])->name('assets.bulk-status');
        Route::post('/quick/bulk-delete', [\App\Http\Controllers\Api\QuickApiController::class, 'bulkDelete'])->name('quick.bulk-delete');

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

        // QR/Barcode Scanning routes — now in routes/api.php

        
        Route::get('/licenses', [\App\Http\Controllers\LicenseController::class, 'index'])->name('licenses.index');

        Route::middleware(['role:Admin|Manager'])->group(function () {
            Route::post('/licenses/bulk-update-status', [\App\Http\Controllers\LicenseController::class, 'bulkUpdateStatus'])->name('licenses.bulk-update-status');
            Route::post('/licenses/import-bulk', [\App\Http\Controllers\LicenseController::class, 'importBulk'])->name('licenses.import-bulk');
            Route::post('/licenses/seats/{seat}/checkout', [\App\Http\Controllers\LicenseController::class, 'checkout'])->name('licenses.seats.checkout');
            Route::post('/licenses/seats/{seat}/checkin', [\App\Http\Controllers\LicenseController::class, 'checkin'])->name('licenses.seats.checkin');
            Route::post('/licenses', [\App\Http\Controllers\LicenseController::class, 'store'])->name('licenses.store');
            Route::put('/licenses/{license}', [\App\Http\Controllers\LicenseController::class, 'update'])->name('licenses.update');
            Route::delete('/licenses/{license}', [\App\Http\Controllers\LicenseController::class, 'destroy'])->name('licenses.destroy');
        });

        Route::middleware(['role:Admin'])->group(function () {
            Route::get('/licenses/trash', [\App\Http\Controllers\LicenseController::class, 'trash'])->name('licenses.trash');
            Route::post('/licenses/{id}/restore', [\App\Http\Controllers\LicenseController::class, 'restore'])->name('licenses.restore');
            Route::delete('/licenses/{id}/force', [\App\Http\Controllers\LicenseController::class, 'forceDelete'])->name('licenses.force-delete');
        });

        Route::middleware(['role:Admin|Manager'])->group(function () {
            Route::get('/asset-track', [\App\Http\Controllers\AssetTrackingController::class, 'index'])->name('asset-track');
            Route::post('/asset-track/checkout', [\App\Http\Controllers\AssetTrackingController::class, 'checkout'])->name('asset-track.checkout');
            Route::patch('/asset-track/{assignment}/checkin', [\App\Http\Controllers\AssetTrackingController::class, 'checkin'])->name('asset-track.checkin');
            Route::post('/asset-track/{assignment}/send-reminder', [\App\Http\Controllers\AssetTrackingController::class, 'sendReminder'])->name('asset-track.send-reminder');
            Route::post('/asset-track/bulk-reminders', [\App\Http\Controllers\AssetTrackingController::class, 'sendBulkReminders'])->name('asset-track.bulk-reminders');
        });

        // Asset Withdrawals Module
    });

    // Multi-Site Module
    Route::get('/multi-site/dashboards', [\App\Http\Controllers\MultiSiteController::class, 'dashboards'])->name('multi-site.dashboards');

    Route::middleware(['role:Admin|Manager'])->group(function () {
        Route::get('/multi-site/tracking', [\App\Http\Controllers\MultiSiteController::class, 'tracking'])->name('multi-site.tracking');
        Route::get('/multi-site/transfers', [\App\Http\Controllers\MultiSiteController::class, 'transfers'])->name('multi-site.transfers');
        Route::post('/multi-site/transfers', [\App\Http\Controllers\MultiSiteController::class, 'storeTransfer'])->name('multi-site.transfers.store');
        Route::patch('/multi-site/transfers/{id}/status', [\App\Http\Controllers\MultiSiteController::class, 'updateTransferStatus'])->name('multi-site.transfers.status');
        Route::get('/multi-site/access', [\App\Http\Controllers\MultiSiteController::class, 'access'])->name('multi-site.access');

        // Regions + Sites API (needs sessions, not api middleware)
        Route::get('/api/sites', [\App\Http\Controllers\Api\SiteApiController::class, 'index']);
        Route::post('/api/sites', [\App\Http\Controllers\Api\SiteApiController::class, 'store']);
        Route::get('/api/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'show']);
        Route::put('/api/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'update']);
        Route::delete('/api/sites/{site}', [\App\Http\Controllers\Api\SiteApiController::class, 'destroy']);
        Route::apiResource('/api/regions', \App\Http\Controllers\Api\RegionApiController::class);
    });

    // Spare Parts Module (moved outside Operations module)
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
        Route::get('/{sparePart}', [\App\Http\Controllers\SparePartController::class, 'show'])->name('spare-parts.show');
        Route::post('/bulk-update-status', [\App\Http\Controllers\SparePartController::class, 'bulkUpdateStatus'])->name('spare-parts.bulk-update-status');
    });


    // System Settings Module
    Route::middleware(['permission:module.system-settings'])->group(function () {
        Route::get('/security/logs', [\App\Http\Controllers\SecurityController::class, 'logs']);
        Route::get('/security/roles', [\App\Http\Controllers\RoleAccessController::class, 'index'])->name('roles.index');
        Route::post('/security/roles/matrix', [\App\Http\Controllers\RoleAccessController::class, 'saveMatrix'])->name('roles.save-matrix');
        Route::resource('users', \App\Http\Controllers\UserController::class);
        Route::patch('/users/{user}/toggle-active', [\App\Http\Controllers\UserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::post('/users/bulk-update', [\App\Http\Controllers\UserController::class, 'bulkUpdate'])->name('users.bulk-update');

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
            Route::patch('/sites/{id}/toggle-active', [\App\Http\Controllers\AdminSiteManagementController::class, 'toggleActive'])->name('admin.sites.toggle-active');

            // Page Permissions Management Routes
            Route::get('/page-permissions', [\App\Http\Controllers\PagePermissionController::class, 'index'])->name('admin.page-permissions');
            Route::get('/page-permissions/user/{user}', [\App\Http\Controllers\PagePermissionController::class, 'getUserPermissions'])->name('admin.page-permissions.user');
            Route::post('/page-permissions/user/{user}', [\App\Http\Controllers\PagePermissionController::class, 'updateUserPermissions'])->name('admin.page-permissions.user.update');
            Route::post('/page-permissions/bulk', [\App\Http\Controllers\PagePermissionController::class, 'bulkUpdatePermissions'])->name('admin.page-permissions.bulk');
            Route::post('/page-permissions/copy', [\App\Http\Controllers\PagePermissionController::class, 'copyPermissions'])->name('admin.page-permissions.copy');
            Route::get('/page-permissions/stats', [\App\Http\Controllers\PagePermissionController::class, 'getStatistics'])->name('admin.page-permissions.stats');
        });

        // Settings CRUD Routes — now in api.php for bulk operations
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

    // Quick creation APIs — now in routes/api.php

});

require __DIR__.'/settings.php';
