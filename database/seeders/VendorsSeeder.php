<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VendorsSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            'IER', 'THALES', 'HP', 'EIZO', 'Fortinet', 'CISCO', 'CesCom', 
            'Microsemi', 'Hewlett-Packard Enterprise', 'NERA', 'Daikin', 
            'Axis Communications', 'Perkins', 'Info-Matic Power', 
            'Marelli', 'ROHDE & SCHWARZ', 'CKNET', 'DELL', 'Panasonic'
        ];

        foreach ($vendors as $vendor) {
            DB::table('vendors')->updateOrInsert(
                ['name' => $vendor],
                []  // No timestamps
            );
        }
    }
}