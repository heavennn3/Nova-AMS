<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    /** Module permission slug → human-readable label (must match RoleAccessController). */
    private const MODULE_PERMISSIONS = [
        'module.asset-inventory' => 'Asset Inventory',
        'module.master-data'     => 'Master Data',
        'module.multi-site'      => 'Multi-Site Management',
        'module.operations'      => 'Operations & Maintenance',
        'module.finance'         => 'Financial Management',
        'module.analytics'       => 'Analytics & Reporting',
        'module.documents'       => 'Document Management',
        'module.advanced'        => 'Advanced Features',
        'module.system-settings' => 'System Settings',
    ];

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // Build the list of module names this user's role can access.
        // Admin always gets everything.
        $modulePermissions = [];
        if ($user) {
            if ($user->hasRole('Admin')) {
                $modulePermissions = array_values(self::MODULE_PERMISSIONS);
            } else {
                foreach (self::MODULE_PERMISSIONS as $slug => $label) {
                    try {
                        if ($user->hasPermissionTo($slug)) {
                            $modulePermissions[] = $label;
                        }
                    } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                        // Ignored if permissions are not seeded
                    }
                }
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id'                => $user->id,
                    'name'              => $user->name,
                    'email'             => $user->email,
                    'roles'             => $user->roles->pluck('name'),
                    'modulePermissions' => $modulePermissions,
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
