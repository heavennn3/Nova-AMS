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
        $siteId = \App\Models\Site::first()?->id ?? 1;

        $spareParts = [
            // RAM Modules
            [
                'name' => 'Kingston DDR4 8GB RAM',
                'part_number' => 'KVR-8GB-PC4',
                'category' => 'Memory',
                'stock_level' => 25,
                'minimum_stock_level' => 10,
                'unit_cost' => 45.00,
                'location' => 'Shelf A-12',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'DDR4',
                    'capacity' => '8GB',
                    'speed' => '3200MHz',
                    'form_factor' => 'DIMM'
                ]),
                'compatibility' => json_encode(['Desktop', 'Laptop', 'Workstation'])
            ],
            [
                'name' => 'Corsair DDR4 16GB RAM',
                'part_number' => 'CMK-16GX4M1A3200C16',
                'category' => 'Memory',
                'stock_level' => 18,
                'minimum_stock_level' => 8,
                'unit_cost' => 75.00,
                'location' => 'Shelf A-14',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'DDR4',
                    'capacity' => '16GB',
                    'speed' => '3200MHz',
                    'form_factor' => 'DIMM'
                ]),
                'compatibility' => json_encode(['Desktop', 'Gaming PC'])
            ],
            [
                'name' => 'Samsung DDR4 32GB RAM',
                'part_number' => 'M378A4G43MB1',
                'category' => 'Memory',
                'stock_level' => 8,
                'minimum_stock_level' => 5,
                'unit_cost' => 120.00,
                'location' => 'Shelf A-16',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'DDR4',
                    'capacity' => '32GB',
                    'speed' => '3200MHz',
                    'form_factor' => 'DIMM'
                ]),
                'compatibility' => json_encode(['Workstation', 'Server'])
            ],

            // Mice
            [
                'name' => 'Logitech Wireless Mouse',
                'part_number' => 'M185',
                'category' => 'Input Devices',
                'stock_level' => 35,
                'minimum_stock_level' => 15,
                'unit_cost' => 15.00,
                'location' => 'Cabinet B-5',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Wireless',
                    'connection' => 'USB Receiver',
                    'dpi' => '1000'
                ]),
                'compatibility' => json_encode(['Desktop', 'Laptop'])
            ],
            [
                'name' => 'Microsoft Optical Mouse',
                'part_number' => 'WM-500',
                'category' => 'Input Devices',
                'stock_level' => 42,
                'minimum_stock_level' => 20,
                'unit_cost' => 12.00,
                'location' => 'Cabinet B-6',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Wired',
                    'connection' => 'USB',
                    'dpi' => '800'
                ]),
                'compatibility' => json_encode(['Desktop', 'Laptop'])
            ],
            [
                'name' => 'Gaming Mouse RGB',
                'part_number' => 'GM-RGB-PRO',
                'category' => 'Input Devices',
                'stock_level' => 15,
                'minimum_stock_level' => 8,
                'unit_cost' => 35.00,
                'location' => 'Cabinet B-8',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Gaming',
                    'connection' => 'USB Wired',
                    'dpi' => '16000',
                    'rgb' => true
                ]),
                'compatibility' => json_encode(['Gaming PC', 'Desktop'])
            ],

            // Monitors
            [
                'name' => 'Dell 24" Monitor',
                'part_number' => 'D24-1080p',
                'category' => 'Display',
                'stock_level' => 12,
                'minimum_stock_level' => 5,
                'unit_cost' => 150.00,
                'location' => 'Shelf C-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'size' => '24 inch',
                    'resolution' => '1920x1080',
                    'panel_type' => 'IPS',
                    'refresh_rate' => '60Hz'
                ]),
                'compatibility' => json_encode(['Desktop', 'Laptop', 'Workstation'])
            ],
            [
                'name' => 'Samsung 27" Curved Monitor',
                'part_number' => 'S27-CURV-144',
                'category' => 'Display',
                'stock_level' => 6,
                'minimum_stock_level' => 3,
                'unit_cost' => 280.00,
                'location' => 'Shelf C-2',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'size' => '27 inch',
                    'resolution' => '2560x1440',
                    'panel_type' => 'VA',
                    'refresh_rate' => '144Hz'
                ]),
                'compatibility' => json_encode(['Gaming PC', 'Workstation'])
            ],
            [
                'name' => 'LG 32" 4K Monitor',
                'part_number' => 'LG-32-4K-UHD',
                'category' => 'Display',
                'stock_level' => 4,
                'minimum_stock_level' => 2,
                'unit_cost' => 450.00,
                'location' => 'Shelf C-3',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'size' => '32 inch',
                    'resolution' => '3840x2160',
                    'panel_type' => 'IPS',
                    'refresh_rate' => '60Hz'
                ]),
                'compatibility' => json_encode(['Workstation', 'Design PC'])
            ],

            // Hard Drives
            [
                'name' => 'Samsung 1TB SSD',
                'part_number' => 'SSD-1TB-SAM',
                'category' => 'Storage',
                'stock_level' => 20,
                'minimum_stock_level' => 10,
                'unit_cost' => 85.00,
                'location' => 'Shelf D-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'NVMe SSD',
                    'capacity' => '1TB',
                    'interface' => 'M.2',
                    'speed' => '3500MB/s'
                ]),
                'compatibility' => json_encode(['Desktop', 'Laptop'])
            ],
            [
                'name' => 'WD 2TB HDD',
                'part_number' => 'HDD-2TB-WD',
                'category' => 'Storage',
                'stock_level' => 15,
                'minimum_stock_level' => 8,
                'unit_cost' => 55.00,
                'location' => 'Shelf D-2',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'HDD',
                    'capacity' => '2TB',
                    'interface' => 'SATA 6Gb/s',
                    'rpm' => '7200'
                ]),
                'compatibility' => json_encode(['Desktop', 'Server', 'NAS'])
            ],

            // Keyboards
            [
                'name' => 'Mechanical Keyboard',
                'part_number' => 'KB-MECH-RGB',
                'category' => 'Input Devices',
                'stock_level' => 18,
                'minimum_stock_level' => 8,
                'unit_cost' => 65.00,
                'location' => 'Cabinet B-10',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Mechanical',
                    'switch_type' => 'Cherry MX Red',
                    'backlight' => 'RGB',
                    'connection' => 'USB Wired'
                ]),
                'compatibility' => json_encode(['Desktop', 'Gaming PC'])
            ],

            // Power Supplies
            [
                'name' => '650W Power Supply',
                'part_number' => 'PSU-650W-BR',
                'category' => 'Power',
                'stock_level' => 10,
                'minimum_stock_level' => 5,
                'unit_cost' => 55.00,
                'location' => 'Shelf E-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'wattage' => '650W',
                    'efficiency' => '80+ Bronze',
                    'modular' => 'Semi-modular'
                ]),
                'compatibility' => json_encode(['Desktop', 'Workstation'])
            ],

            // Cables
            [
                'name' => 'HDMI Cable 6ft',
                'part_number' => 'CBL-HDMI-6',
                'category' => 'Cables',
                'stock_level' => 50,
                'minimum_stock_level' => 25,
                'unit_cost' => 8.00,
                'location' => 'Drawer F-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'HDMI',
                    'length' => '6 feet',
                    'version' => 'HDMI 2.0'
                ]),
                'compatibility' => json_encode(['Monitor', 'TV', 'Projector'])
            ],
            [
                'name' => 'USB-C Cable 3ft',
                'part_number' => 'CBL-USBC-3',
                'category' => 'Cables',
                'stock_level' => 40,
                'minimum_stock_level' => 20,
                'unit_cost' => 12.00,
                'location' => 'Drawer F-2',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'USB-C',
                    'length' => '3 feet',
                    'version' => 'USB 3.1'
                ]),
                'compatibility' => json_encode(['Laptop', 'Tablet', 'Phone'])
            ],

            // Thermal Paste
            [
                'name' => 'Arctic Silver Thermal Paste',
                'part_number' => 'TP-ARCTIC-5G',
                'category' => 'Cooling',
                'stock_level' => 25,
                'minimum_stock_level' => 15,
                'unit_cost' => 8.00,
                'location' => 'Drawer G-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Thermal Compound',
                    'quantity' => '5 grams',
                    'thermal_conductivity' => '8.5 W/mK'
                ]),
                'compatibility' => json_encode(['CPU', 'GPU'])
            ],

            // Laptop Batteries
            [
                'name' => 'Universal Laptop Battery',
                'part_number' => 'BAT-LPT-UNI',
                'category' => 'Power',
                'stock_level' => 8,
                'minimum_stock_level' => 5,
                'unit_cost' => 45.00,
                'location' => 'Shelf H-1',
                'site_id' => $siteId,
                'status' => 'available',
                'specifications' => json_encode([
                    'type' => 'Lithium-Ion',
                    'voltage' => '11.1V',
                    'capacity' => '5200mAh'
                ]),
                'compatibility' => json_encode(['Laptop', 'Notebook'])
            ],
        ];

        foreach ($spareParts as $part) {
            \App\Models\SparePart::create($part);
        }

        $this->command->info('Spare parts seeded successfully!');
    }
}
