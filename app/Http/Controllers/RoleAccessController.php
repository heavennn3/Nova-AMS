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
        'Dashboard'       => 'module.dashboard',
        'ICT Asset List'  => 'module.asset-inventory',
        'Asset Loan'      => 'module.asset-loans',
        'Spare Part'      => 'module.spare-parts',
        'Key & Licenses'  => 'module.licenses',
        'Site Dashboard'  => 'module.multi-site-dashboards',
        'Asset Transfer'  => 'module.asset-transfer',
        'Requests'        => 'module.requests-admin',
        'Asset Track'     => 'module.asset-track',
        'Audit Log'       => 'module.security-logs',
        'Deleted Items'   => 'module.recycle-bin',
        'Users'           => 'module.users',
        'Access Control'  => 'module.access-control',
        'Setting'         => 'module.settings',
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
