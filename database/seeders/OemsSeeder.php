<?php

namespace Database\Seeders;

use App\Models\Oem;
use Illuminate\Database\Seeder;

class OemsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['IER', 'Thales', 'Eizo', 'HP'] as $name) {
            Oem::firstOrCreate(['name' => $name]);
        }
    }
}
