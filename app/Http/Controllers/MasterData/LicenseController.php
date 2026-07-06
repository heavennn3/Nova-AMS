<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreLicenseRequest;
use App\Http\Requests\MasterData\UpdateLicenseRequest;
use App\Models\License;
use App\Models\LicenseSeat;
use Illuminate\Support\Facades\DB;

class LicenseController extends Controller
{
    public function index()
    {
        return response()->json(License::with(['vendor', 'site'])->get());
    }

    public function store(StoreLicenseRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $licenseData = array_merge($validated, [
                'used_seats' => 0,
                'available_seats' => $validated['total_seats'],
                'compliance_status' => 'compliant',
            ]);
            $license = License::create($licenseData);
            for ($i = 1; $i <= $validated['total_seats']; $i++) {
                LicenseSeat::create([
                    'license_id' => $license->id,
                    'seat_number' => $i,
                    'seat_status' => 'available',
                ]);
            }
        });
        return back()->with('success', 'License created.');
    }

    public function update(UpdateLicenseRequest $request, $id)
    {
        $license = License::findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($license, $validated) {
            $oldSeats = $license->licenseSeats()->count();
            $newSeats = (int)$validated['total_seats'];

            if ($newSeats > $oldSeats) {
                for ($i = $oldSeats + 1; $i <= $newSeats; $i++) {
                    LicenseSeat::create([
                        'license_id' => $license->id,
                        'seat_number' => $i,
                        'seat_status' => 'available',
                    ]);
                }
                $validated['available_seats'] = $license->available_seats + ($newSeats - $oldSeats);
            } elseif ($newSeats < $oldSeats) {
                $assigned = $license->licenseSeats()->where('seat_status', 'assigned')->count();
                if ($assigned > $newSeats) {
                    return back()->with('error', "Cannot reduce seats: {$assigned} seat(s) are assigned.");
                }
                $license->licenseSeats()
                    ->where('seat_status', 'available')
                    ->orderBy('seat_number', 'desc')
                    ->limit($oldSeats - $newSeats)
                    ->delete();
                $validated['available_seats'] = $newSeats - $assigned;
            }
            $license->update($validated);
        });
        return back()->with('success', 'License updated.');
    }

    public function destroy($id)
    {
        $license = License::findOrFail($id);
        $assigned = $license->licenseSeats()->where('seat_status', 'assigned')->count();
        if ($assigned > 0) {
            return back()->with('error', "Cannot delete: {$assigned} seat(s) are currently assigned.");
        }
        $license->licenseSeats()->delete();
        $license->delete();
        return back()->with('success', 'License deleted.');
    }
}
