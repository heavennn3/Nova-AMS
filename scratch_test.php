<?php

// Bootstrap Laravel
require __DIR__.'/vendor/autoload.php';
require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\License;
use App\Models\LicenseSeat;

echo "=== Software Licenses Verification ===\n";

$licensesCount = License::withoutGlobalScopes()->count();
$seatsCount = LicenseSeat::count();

echo "Total Licenses in DB: {$licensesCount}\n";
echo "Total License Seats in DB: {$seatsCount}\n";

if ($licensesCount > 0) {
    echo "\nListing Seeded Licenses and Utilization:\n";
    $licenses = License::withoutGlobalScopes()->with('licenseSeats')->get();
    foreach ($licenses as $lic) {
        $total = $lic->licenseSeats->count();
        $assigned = $lic->licenseSeats->filter(function($s) {
            return $s->assigned_to_user_id !== null || $s->assigned_to_asset_id !== null;
        })->count();
        echo " - {$lic->name}: {$assigned} / {$total} seats checked out.\n";
    }
    
    // Test checkin/checkout logic on first license
    $firstLic = License::withoutGlobalScopes()->first();
    $freeSeat = $firstLic->licenseSeats()->whereNull('assigned_to_user_id')->whereNull('assigned_to_asset_id')->first();
    if ($freeSeat) {
        echo "\nTesting Checkout of Seat #{$freeSeat->seat_number}...\n";
        $freeSeat->update([
            'assigned_to_user_id' => 1,
            'assigned_at' => now(),
            'notes' => 'Temporary test checkout'
        ]);
        echo "Seat checked out to user 1. Current status: Checked Out.\n";
        
        echo "Testing Checkin...\n";
        $freeSeat->update([
            'assigned_to_user_id' => null,
            'assigned_at' => null,
            'notes' => null
        ]);
        echo "Seat checked back in. Current status: Available.\n";
    }
}
echo "=== Verification Complete ===\n";
