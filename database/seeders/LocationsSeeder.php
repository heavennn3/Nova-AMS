<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationsSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['name' => 'BRO-KK/ATCC K. Kinabalu - Center', 'state' => 'Sabah'],
            ['name' => 'BRO-KK/ATCC K. Kinabalu - NOC Room', 'state' => 'Sabah'],
            ['name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room', 'state' => 'Sabah'],
            ['name' => 'BRO-KK/RADAR K. Kinabalu - RADAR Tower', 'state' => 'Sabah'],
            ['name' => 'BRO-KK/RADAR K. Kinabalu - RADAR Building', 'state' => 'Sabah'],
            ['name' => 'BRO-KK/ATCC K. Kinabalu (ATCC Tower)', 'state' => 'Sabah'],
            ['name' => 'BRO-SKN/RADAR Sandakan - RADAR Building', 'state' => 'Sabah'],
            ['name' => 'BRO-SKN/LT Sandakan (Tower - Level 6)', 'state' => 'Sabah'],
            ['name' => 'BRO-TWU/LT Tawau (Tower - Level 7)', 'state' => 'Sabah'],
            ['name' => 'WRO-KCH/ATCC Kuching - Center', 'state' => 'Sarawak'],
            ['name' => 'WRO-KCH/RADAR Kuching - RADAR Building', 'state' => 'Sarawak'],
            ['name' => 'WRO-MRI/LT Miri (APP RADAR) - Approach Room', 'state' => 'Sarawak'],
            ['name' => 'WRO-MRI/LT Miri (APP RADAR) - Equipment Room', 'state' => 'Sarawak'],
            ['name' => 'WRO-BIN/LT Bintulu (Tower, Rooftop)', 'state' => 'Sarawak'],
            ['name' => 'WRO-SBU/LT Sibu - Tower (VCR Area, Level 5)', 'state' => 'Sarawak'],
        ];

        foreach ($locations as $location) {
            DB::table('locations')->updateOrInsert(
                ['name' => $location['name']],
                ['state' => $location['state']]
            );
        }
    }
}