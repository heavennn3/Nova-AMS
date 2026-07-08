<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Site;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default site
        $site = Site::create([
            'name' => 'Head Office',
            'code' => 'HQ-001',
            'region' => 'Central',
            'address' => 'Main Office Building',
            'contact_email' => 'admin@novaams.com',
            'contact_phone' => '+60123456789',
        ]);

        // Create roles
        $adminRole = Role::create(['name' => 'Admin']);
        $managerRole = Role::create(['name' => 'Manager']);
        $employeeRole = Role::create(['name' => 'Employee']);

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@novaams.com',
            'password' => Hash::make('admin123'),
            'site_id' => $site->id,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        $this->command->info('✅ Admin user created successfully!');
        $this->command->info('📧 Email: admin@novaams.com');
        $this->command->info('🔑 Password: admin123');
        $this->command->info('');
        $this->command->info('⚠️  Please change the password after first login!');
    }
}
