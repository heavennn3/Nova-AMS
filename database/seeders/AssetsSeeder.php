<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetsSeeder extends Seeder
{
    public function run(): void
    {
        // Get lookup IDs
        $hardwareId = DB::table('asset_categories')->where('name', 'Hardware')->value('id');
        $appId = DB::table('asset_categories')->where('name', 'Application')->value('id');
        
        // Helper function to get type ID
        $getTypeId = function($typeName, $categoryId) {
            return DB::table('asset_types')
                ->where('name', $typeName)
                ->where('category_id', $categoryId)
                ->value('id');
        };
        
        // Helper function to get vendor ID
        $getVendorId = function($vendorName) {
            return DB::table('vendors')->where('name', $vendorName)->value('id');
        };
        
        // Helper function to get location ID
        $getLocationId = function($locationName) {
            return DB::table('locations')->where('name', $locationName)->value('id');
        };

        $assets = [
            // ========== KOTA KINABALU ASSETS ==========
            // Strip Printers (IER)
            [
                'asset_id' => 'ATM-543129', 'category_id' => $hardwareId, 'type_name' => 'STRIP PRINTER',
                'product_name' => 'Strip Printer 400B2-01', 'brand' => 'IER', 'vendor_name' => 'IER',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543130', 'category_id' => $hardwareId, 'type_name' => 'STRIP PRINTER',
                'product_name' => 'Strip Printer 400B2-01', 'brand' => 'IER', 'vendor_name' => 'IER',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543131', 'category_id' => $hardwareId, 'type_name' => 'STRIP PRINTER',
                'product_name' => 'Strip Printer 400B2-01', 'brand' => 'IER', 'vendor_name' => 'IER',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - NOC Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543132', 'category_id' => $hardwareId, 'type_name' => 'STRIP PRINTER',
                'product_name' => 'Strip Printer 400B2-01', 'brand' => 'IER', 'vendor_name' => 'IER',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - NOC Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Servers (THALES)
            [
                'asset_id' => 'ATM-543133', 'category_id' => $hardwareId, 'type_name' => 'SERVER',
                'product_name' => 'pLinesE4', 'brand' => 'THALES', 'vendor_name' => 'THALES',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543134', 'category_id' => $hardwareId, 'type_name' => 'SERVER',
                'product_name' => 'pLinesE4', 'brand' => 'THALES', 'vendor_name' => 'THALES',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543181', 'category_id' => $hardwareId, 'type_name' => 'SERVER',
                'product_name' => 'pLinesE4', 'brand' => 'THALES', 'vendor_name' => 'THALES',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543183', 'category_id' => $hardwareId, 'type_name' => 'SERVER',
                'product_name' => 'pLinesE4', 'brand' => 'THALES', 'vendor_name' => 'THALES',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Workstations (HP/HPE)
            [
                'asset_id' => 'ATM-543135', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543138', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543141', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543144', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543147', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // More workstations continue...
            [
                'asset_id' => 'ATM-543150', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543153', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543156', 'category_id' => $hardwareId, 'type_name' => 'WORKSTATION',
                'product_name' => 'Workstation Z4 G4 (HS)', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Monitors (EIZO) - Sample
            [
                'asset_id' => 'ATM-543136', 'category_id' => $hardwareId, 'type_name' => 'MONITOR',
                'product_name' => 'EIZO', 'brand' => 'EIZO', 'vendor_name' => 'EIZO',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543137', 'category_id' => $hardwareId, 'type_name' => 'MONITOR',
                'product_name' => 'EIZO', 'brand' => 'EIZO', 'vendor_name' => 'EIZO',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Center',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Switches (CISCO)
            [
                'asset_id' => 'ATM-543175', 'category_id' => $hardwareId, 'type_name' => 'SWITCH',
                'product_name' => 'WS-C3650-24TS-L Catalyst 3650 Switch', 'brand' => 'CISCO', 'vendor_name' => 'CISCO',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543176', 'category_id' => $hardwareId, 'type_name' => 'SWITCH',
                'product_name' => 'WS-C3650-24TS-L Catalyst 3650 Switch', 'brand' => 'CISCO', 'vendor_name' => 'CISCO',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Firewalls (Fortinet)
            [
                'asset_id' => 'ATM-543166', 'category_id' => $hardwareId, 'type_name' => 'FIREWALL',
                'product_name' => 'Fortigate 100E', 'brand' => 'Fortinet', 'vendor_name' => 'Fortinet',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            [
                'asset_id' => 'ATM-543167', 'category_id' => $hardwareId, 'type_name' => 'FIREWALL',
                'product_name' => 'Fortigate 100E', 'brand' => 'Fortinet', 'vendor_name' => 'Fortinet',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
            
            // Server Racks (HP)
            [
                'asset_id' => 'ATM-543194', 'category_id' => $hardwareId, 'type_name' => 'SERVER RACK',
                'product_name' => 'HPE A642 1075 RACK', 'brand' => 'HP', 'vendor_name' => 'HP',
                'purchase_year' => 2022, 'location_name' => 'BRO-KK/ATCC K. Kinabalu - Equipment Room',
                'status' => 'in_use', 'condition_status' => 'good'
            ],
        ];

        // Insert all assets
        foreach ($assets as $asset) {
            DB::table('assets')->updateOrInsert(
                ['asset_id' => $asset['asset_id']],
                [
                    'category_id' => $asset['category_id'],
                    'type_id' => $getTypeId($asset['type_name'], $asset['category_id']),
                    'product_name' => $asset['product_name'],
                    'brand' => $asset['brand'],
                    'vendor_id' => $getVendorId($asset['vendor_name']),
                    'purchase_year' => $asset['purchase_year'],
                    'location_id' => $getLocationId($asset['location_name']),
                    'status' => $asset['status'],
                    'condition_status' => $asset['condition_status'],
                ]
            );
        }
    }
}