<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAccessController extends Controller
{
    /**
     * Maps human-readable module names → Spatie permission slugs.
     * A role having this permission = it has access to that module.
     */
    private const MODULE_PERMISSIONS = [
        'Asset Inventory'         => 'module.asset-inventory',
        'Master Data'             => 'module.master-data',
        'Multi-Site Management'   => 'module.multi-site',
        'Operations & Maintenance'=> 'module.operations',
        'Financial Management'    => 'module.finance',
        'Analytics & Reporting'   => 'module.analytics',
        'Document Management'     => 'module.documents',
        'Advanced Features'       => 'module.advanced',
        'System Settings'         => 'module.system-settings',
    ];

    private array $roleDescriptions = [
        'Admin'        => 'Full system access — all modules, all sites.',
        'Site Manager' => 'Manages assets and users within their assigned site.',
        'Technician'   => 'Can view and complete work orders, update asset statuses.',
        'Viewer'       => 'Read-only access to asset data and reports.',
    ];

    /**
     * Ensure all module permissions exist in the DB, then return a matrix
     * of [roleName][moduleName] => bool from real Spatie data.
     */
    public function index()
    {
        $this->ensureModulePermissionsExist();

        $dbRoles = Role::with('permissions')->get();

        $roles = $dbRoles->map(function ($role) {
            // Build the per-module access map from this role's real permissions
            $moduleAccess = [];
            foreach (self::MODULE_PERMISSIONS as $module => $permSlug) {
                $moduleAccess[$module] = $role->permissions->contains('name', $permSlug);
            }

            return [
                'id'           => $role->id,
                'name'         => $role->name,
                'description'  => $this->roleDescriptions[$role->name] ?? 'Custom role.',
                'moduleAccess' => $moduleAccess,
            ];
        })->values()->toArray();

        return Inertia::render('Security/Roles', [
            'roles'   => $roles,
            'modules' => array_keys(self::MODULE_PERMISSIONS),
        ]);
    }

    /**
     * Receive the updated matrix from the frontend and sync Spatie permissions.
     *
     * Expected payload:
     *   { matrix: { "Admin": { "Asset Inventory": true, ... }, ... } }
     */
    public function saveMatrix(Request $request)
    {
        $request->validate([
            'matrix'   => 'required|array',
            'matrix.*' => 'array',
        ]);

        $this->ensureModulePermissionsExist();

        $matrix = $request->input('matrix'); // [roleName => [module => bool]]

        foreach ($matrix as $roleName => $moduleMap) {
            $role = Role::findByName($roleName);

            // Collect only the module permission slugs that should be GRANTED
            $permissionsToGrant = [];
            foreach ($moduleMap as $module => $hasAccess) {
                $permSlug = self::MODULE_PERMISSIONS[$module] ?? null;
                if ($permSlug && $hasAccess) {
                    $permissionsToGrant[] = $permSlug;
                }
            }

            // Load the role's NON-module permissions so we don't wipe them
            $existingNonModulePerms = $role->permissions
                ->whereNotIn('name', array_values(self::MODULE_PERMISSIONS))
                ->pluck('name')
                ->toArray();

            // Sync = replace all module perms with the new set, keep the rest
            $role->syncPermissions(array_merge($existingNonModulePerms, $permissionsToGrant));
        }

        // Clear Spatie's permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        return back()->with('success', 'Permissions saved successfully.');
    }

    /**
     * Create any missing module permissions so the DB is always in sync.
     */
    private function ensureModulePermissionsExist(): void
    {
        foreach (self::MODULE_PERMISSIONS as $permSlug) {
            Permission::firstOrCreate(['name' => $permSlug]);
        }
    }
}
