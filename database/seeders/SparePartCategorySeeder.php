<?php

namespace Database\Seeders;

use App\Models\SparePartCategory;
use Illuminate\Database\Seeder;

class SparePartCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'IT Equipment' => ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Projector'],
            'Network Equipment' => ['Router', 'Switch', 'Access Point', 'Firewall'],
            'Furniture' => ['Desk', 'Chair', 'Cabinet'],
            'Spare Parts' => ['RAM', 'SSD', 'Battery', 'Charger', 'Keyboard', 'Mouse', 'Cables', 'Fans', 'Power Supply'],
            'Tools' => ['Screwdriver Set', 'Crimping Tool', 'Multimeter', 'Drill'],
            'Consumables' => ['Printer Paper', 'Toner', 'Ink Cartridge', 'Labels', 'Cleaning Wipes'],
        ];

        foreach ($categories as $parentName => $children) {
            $parent = SparePartCategory::create(['name' => $parentName]);
            foreach ($children as $childName) {
                SparePartCategory::create([
                    'name' => $childName,
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }
}
