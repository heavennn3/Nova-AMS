<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndSitesSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Module Permissions
        $modulePermissions = [
            'module.asset-inventory', 'module.master-data', 'module.multi-site',
            'module.operations', 'module.finance', 'module.analytics',
            'module.advanced', 'module.system-settings',
        ];

        foreach ($modulePermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Basic Permissions
        $basicPermissions = ['manage assets', 'view assets', 'approve transfers', 'manage users', 'manage sites'];
        foreach ($basicPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        $siteManagerRole = Role::firstOrCreate(['name' => 'Site Manager']);
        $siteManagerRole->syncPermissions([
            'manage assets', 'view assets', 'approve transfers',
            'module.asset-inventory', 'module.master-data', 'module.operations',
            'module.analytics',
        ]);

        $technicianRole = Role::firstOrCreate(['name' => 'Technician']);
        $technicianRole->syncPermissions([
            'view assets', 'module.asset-inventory', 'module.operations',
            'module.analytics',
        ]);

        $viewerRole = Role::firstOrCreate(['name' => 'Viewer']);
        $viewerRole->syncPermissions([
            'view assets', 'module.asset-inventory', 'module.analytics',
        ]);

        // Sites are now managed through the Master Data UI.

        // Create an Admin user if it doesn't exist
        $admin = User::firstOrCreate([
            'email' => 'admin@nova-ams.com'
        ], [
            'name' => 'System Administrator',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        if (!$admin->hasRole('Admin')) {
            $admin->assignRole('Admin');
        }
    }
}
