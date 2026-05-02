<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class RolesAndSitesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'manage assets',
            'view assets',
            'approve transfers',
            'manage users',
            'manage sites'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and assign existing permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        $siteManagerRole = Role::firstOrCreate(['name' => 'Site Manager']);
        $siteManagerRole->givePermissionTo(['manage assets', 'view assets', 'approve transfers']);

        $technicianRole = Role::firstOrCreate(['name' => 'Technician']);
        $technicianRole->givePermissionTo(['view assets']);

        $viewerRole = Role::firstOrCreate(['name' => 'Viewer']);
        $viewerRole->givePermissionTo(['view assets']);

        // Insert the 7 KK FIR Sites
        $sites = [
            ['name' => 'ATCC Kota Kinabalu', 'code' => 'BKI'],
            ['name' => 'Radar Station 1', 'code' => 'R1'],
            ['name' => 'Radar Station 2', 'code' => 'R2'],
            ['name' => 'Communication Site Alpha', 'code' => 'COM-A'],
            ['name' => 'Communication Site Bravo', 'code' => 'COM-B'],
            ['name' => 'Navigation Aid Miri', 'code' => 'NAV-MYY'],
            ['name' => 'Navigation Aid Tawau', 'code' => 'NAV-TWU'],
        ];

        foreach ($sites as $site) {
            DB::table('sites')->updateOrInsert(
                ['code' => $site['code']],
                ['name' => $site['name'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
        
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
