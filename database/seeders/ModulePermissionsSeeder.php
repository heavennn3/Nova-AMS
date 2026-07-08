<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ModulePermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create module permissions
        $modules = [
            'module.asset-inventory',
            'module.master-data',
            'module.multi-site',
            'module.system-settings',
        ];

        foreach ($modules as $module) {
            Permission::create(['name' => $module]);
        }

        // Assign all permissions to Admin role
        $adminRole = Role::where('name', 'Admin')->first();
        $adminRole->givePermissionTo(Permission::all());

        // Assign limited permissions to Manager role
        $managerRole = Role::where('name', 'Manager')->first();
        $managerRole->givePermissionTo([
            'module.asset-inventory',
            'module.master-data',
            'module.multi-site',
        ]);

        // Assign basic permissions to Employee role
        $employeeRole = Role::where('name', 'Employee')->first();
        $employeeRole->givePermissionTo([
            'module.asset-inventory',
        ]);

        $this->command->info('✅ Module permissions created and assigned successfully!');
    }
}
