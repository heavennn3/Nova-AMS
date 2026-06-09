<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First seed roles, permissions, sites, and the admin user
        $this->call(RolesAndSitesSeeder::class);
        $this->call(AssetCategoriesSeeder::class);
        $this->call(LocationsSeeder::class);
        $this->call(VendorsSeeder::class);
        $this->call(LicensesSeeder::class);
    }
}
