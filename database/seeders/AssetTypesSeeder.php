<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetTypesSeeder extends Seeder
{
    public function run(): void
    {
        // Get category IDs
        $hardwareId = DB::table('asset_categories')->where('name', 'Hardware')->value('id');
        $appId = DB::table('asset_categories')->where('name', 'Application')->value('id');

        $types = [
            // Hardware types
            ['category_id' => $hardwareId, 'name' => 'STRIP PRINTER'],
            ['category_id' => $hardwareId, 'name' => 'SERVER'],
            ['category_id' => $hardwareId, 'name' => 'WORKSTATION'],
            ['category_id' => $hardwareId, 'name' => 'MONITOR'],
            ['category_id' => $hardwareId, 'name' => 'FIREWALL'],
            ['category_id' => $hardwareId, 'name' => 'SWITCH'],
            ['category_id' => $hardwareId, 'name' => 'SPLITTER'],
            ['category_id' => $hardwareId, 'name' => 'TIME SERVER'],
            ['category_id' => $hardwareId, 'name' => 'SERVER RACK'],
            ['category_id' => $hardwareId, 'name' => 'ROUTER'],
            ['category_id' => $hardwareId, 'name' => 'WAVEGUIDE'],
            ['category_id' => $hardwareId, 'name' => 'COUPLER'],
            ['category_id' => $hardwareId, 'name' => 'AMP BREAKER'],
            ['category_id' => $hardwareId, 'name' => 'FLEXIBLE CORRUGATED CABLE'],
            ['category_id' => $hardwareId, 'name' => 'ADS-B ANTENNA'],
            ['category_id' => $hardwareId, 'name' => 'AIR CONDITIONING'],
            ['category_id' => $hardwareId, 'name' => 'ANTENNA'],
            ['category_id' => $hardwareId, 'name' => 'GPS ANTENNA'],
            ['category_id' => $hardwareId, 'name' => 'CCTV'],
            ['category_id' => $hardwareId, 'name' => 'RADAR SSR ANTENNA'],
            ['category_id' => $hardwareId, 'name' => 'UPS RACK MODULE'],
            ['category_id' => $hardwareId, 'name' => 'VCS EQUIPMENT RACK'],
            ['category_id' => $hardwareId, 'name' => 'VHF RX'],
            ['category_id' => $hardwareId, 'name' => 'VHF TX'],
            ['category_id' => $hardwareId, 'name' => 'CPMS SERVER'],
            ['category_id' => $hardwareId, 'name' => 'MICROWAVE BACKHAUL RADIO UNIT'],
            ['category_id' => $hardwareId, 'name' => 'TELECOM POWER RECTIFIER SYSTEM'],
            ['category_id' => $hardwareId, 'name' => 'GENSET ENGINE'],
            ['category_id' => $hardwareId, 'name' => 'GROUNDING KIT'],
            ['category_id' => $hardwareId, 'name' => 'TNC CONNECTOR'],
            ['category_id' => $hardwareId, 'name' => 'POWER SUPPLY UNIT'],
            ['category_id' => $hardwareId, 'name' => 'CABINET'],
            ['category_id' => $hardwareId, 'name' => 'RADAR AN 2000'],
            ['category_id' => $hardwareId, 'name' => 'DIGITAL MICROWAVE'],
            ['category_id' => $hardwareId, 'name' => 'DOOR CONTROLLER'],
            ['category_id' => $hardwareId, 'name' => 'ELECTRONIC CARD READER'],
            // Application types
            ['category_id' => $appId, 'name' => 'RADAR CBP PRP SOFTWARE'],
            ['category_id' => $appId, 'name' => 'RADAR IBIS SWI'],
            ['category_id' => $appId, 'name' => 'RADAR IRPC SOFTWARE'],
            ['category_id' => $appId, 'name' => 'RADAR RCMS THALIX INSTALLER'],
            ['category_id' => $appId, 'name' => 'RADAR RCMS STATION'],
            ['category_id' => $appId, 'name' => 'RADAR PARAMETERS FILES'],
            ['category_id' => $appId, 'name' => 'RADAR STAR RSM TRAC SOFTWARE'],
            ['category_id' => $appId, 'name' => 'RADAR VARIATOR PARAMETERS'],
        ];

        foreach ($types as $type) {
            DB::table('asset_types')->updateOrInsert(
                ['category_id' => $type['category_id'], 'name' => $type['name']],
                []  // No timestamps
            );
        }
    }
}