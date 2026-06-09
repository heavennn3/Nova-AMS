<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\License;
use App\Models\LicenseSeat;
use App\Models\User;
use App\Models\Asset;
use App\Models\Vendor;
use App\Models\Site;

class LicensesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vendorDell = Vendor::where('name', 'DELL')->first();
        $vendorHp = Vendor::where('name', 'HP')->first();
        $vendorFortinet = Vendor::where('name', 'Fortinet')->first();

        $siteBki = Site::where('code', 'BKI')->first();
        $siteR1 = Site::where('code', 'R1')->first();

        $users = User::all();
        $assets = Asset::all();

        $licensesData = [
            [
                'name' => 'Microsoft Windows 11 Enterprise LTSC',
                'product_key' => 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
                'seats' => 30,
                'purchase_cost' => 150.00,
                'purchase_date' => '2025-01-15',
                'expiration_date' => '2030-01-15',
                'license_email' => 'procurement@nova-ams.com',
                'license_name' => 'Department of Civil Aviation BKI',
                'vendor_id' => $vendorDell ? $vendorDell->id : null,
                'site_id' => $siteBki ? $siteBki->id : null,
                'notes' => 'LTSC version for air traffic controller workstations.',
            ],
            [
                'name' => 'Adobe Creative Cloud All Apps',
                'product_key' => 'ADOB-CC-9981-8822-7711-0099',
                'seats' => 10,
                'purchase_cost' => 599.99,
                'purchase_date' => '2026-02-10',
                'expiration_date' => '2027-02-10',
                'license_email' => 'design@nova-ams.com',
                'license_name' => 'Nova AMS Creative Team',
                'vendor_id' => $vendorHp ? $vendorHp->id : null,
                'site_id' => $siteBki ? $siteBki->id : null,
                'notes' => 'Annual subscription renewal required.',
            ],
            [
                'name' => 'FortiGuard Unified Threat Protection (UTP)',
                'product_key' => 'FG-UTP-8829-9182-9900',
                'seats' => 3,
                'purchase_cost' => 1250.00,
                'purchase_date' => '2025-06-01',
                'expiration_date' => '2026-06-01', // Expiring soon or today!
                'license_email' => 'admin@nova-ams.com',
                'license_name' => 'Radar Station Security team',
                'vendor_id' => $vendorFortinet ? $vendorFortinet->id : null,
                'site_id' => $siteR1 ? $siteR1->id : null,
                'notes' => 'Security subscriptions for perimeter firewall devices.',
            ],
            [
                'name' => 'JetBrains All Products Pack',
                'product_key' => 'JB-APP-2918-2993-8823',
                'seats' => 5,
                'purchase_cost' => 249.00,
                'purchase_date' => '2026-03-01',
                'expiration_date' => '2027-03-01',
                'license_email' => 'devops@nova-ams.com',
                'license_name' => 'DCA Engineering Team',
                'vendor_id' => $vendorDell ? $vendorDell->id : null,
                'site_id' => $siteBki ? $siteBki->id : null,
                'notes' => 'Licenses for internal software engineers.',
            ]
        ];

        foreach ($licensesData as $data) {
            $license = License::create($data);

            // Create Seats
            for ($i = 1; $i <= $license->seats; $i++) {
                $seat = LicenseSeat::create([
                    'license_id' => $license->id,
                    'seat_number' => $i,
                ]);

                // Assign some seats to assets or users for testing
                if ($license->name === 'Microsoft Windows 11 Enterprise LTSC' && $i <= 12 && $assets->count() > 0) {
                    $assetIndex = ($i - 1) % $assets->count();
                    $seat->update([
                        'assigned_to_asset_id' => $assets[$assetIndex]->id,
                        'assigned_at' => now()->subMonths(3),
                        'notes' => 'Auto-assigned to workstation during deployment.',
                    ]);
                } elseif ($license->name === 'Adobe Creative Cloud All Apps' && $i <= 6 && $users->count() > 0) {
                    $userIndex = ($i - 1) % $users->count();
                    $seat->update([
                        'assigned_to_user_id' => $users[$userIndex]->id,
                        'assigned_at' => now()->subMonths(1),
                        'notes' => 'Assigned for media editing task.',
                    ]);
                } elseif ($license->name === 'FortiGuard Unified Threat Protection (UTP)' && $i <= 2 && $assets->count() > 0) {
                    $assetIndex = ($i + 1) % $assets->count();
                    $seat->update([
                        'assigned_to_asset_id' => $assets[$assetIndex]->id,
                        'assigned_at' => now()->subMonths(11),
                        'notes' => 'Bound to main firewall appliance.',
                    ]);
                } elseif ($license->name === 'JetBrains All Products Pack' && $i <= 2 && $users->count() > 0) {
                    $userIndex = ($i) % $users->count();
                    $seat->update([
                        'assigned_to_user_id' => $users[$userIndex]->id,
                        'assigned_at' => now()->subDays(10),
                    ]);
                }
            }
        }
    }
}
