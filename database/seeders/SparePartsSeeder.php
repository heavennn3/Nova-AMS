<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SparePartsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder will use real data from the database
        // Spare parts should be created through the admin interface
        // This seeder is kept for consistency but does not seed mock data

        $this->command->info('Spare parts seeder executed - no mock data created.');
    }
}
