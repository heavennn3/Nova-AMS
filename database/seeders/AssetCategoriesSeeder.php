<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('asset_categories')->insert([
            ['name' => 'Hardware'],
            ['name' => 'Application'],
        ]);
    }
}