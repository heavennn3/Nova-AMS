<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\LicenseSeat;
use App\Models\User;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LicenseController extends Controller
{
    public function index()
    {
        $licenses = License::with(['vendor', 'site', 'licenseSeats'])
            ->get()
            ->map(function ($license) {
                $totalSeats = $license->licenseSeats->count();
                $assignedSeats = $license->licenseSeats->filter(function ($seat) {
                    return $seat->assigned_to_user_id !== null || $seat->assigned_to_asset_id !== null;
                })->count();

                return [
                    'id' => $license->id,
                    'name' => $license->name,
                    'product_key' => $license->product_key,
                    'seats' => $totalSeats,
                    'assigned_seats_count' => $assignedSeats,
                    'available_seats_count' => $totalSeats - $assignedSeats,
                    'purchase_cost' => $license->purchase_cost,
                    'purchase_date' => $license->purchase_date ? $license->purchase_date->format('Y-m-d') : null,
                    'expiration_date' => $license->expiration_date ? $license->expiration_date->format('Y-m-d') : null,
                    'license_email' => $license->license_email,
                    'license_name' => $license->license_name,
                    'vendor' => $license->vendor ? $license->vendor->name : null,
                    'vendor_id' => $license->vendor_id,
                    'site' => $license->site ? $license->site->name : null,
                    'site_id' => $license->site_id,
                    'notes' => $license->notes,
                    'created_at' => $license->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        
        // Load assets with their site details for checkout target info
        $assets = Asset::with('site')->orderBy('product_name')->get()
            ->map(function($asset) {
                return [
                    'id' => $asset->id,
                    'name' => $asset->product_name . ' (' . ($asset->serial_number ?: 'No Serial') . ')',
                    'site' => $asset->site ? $asset->site->name : 'No Site',
                ];
            });

        $sites = DB::table('sites')->select('id', 'name')->orderBy('name')->get();
        $vendors = DB::table('vendors')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Licenses/Index', [
            'licenses' => $licenses,
            'users' => $users,
            'assets' => $assets,
            'sites' => $sites,
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $license = License::create($validated);

            // Generate Seats
            for ($i = 1; $i <= $validated['seats']; $i++) {
                LicenseSeat::create([
                    'license_id' => $license->id,
                    'seat_number' => $i,
                ]);
            }
        });

        return redirect()->route('licenses.index')->with('success', 'License created successfully.');
    }

    public function show(License $license)
    {
        $license->load(['vendor', 'site', 'licenseSeats.assignedUser', 'licenseSeats.assignedAsset']);

        $totalSeats = $license->licenseSeats->count();
        $assignedSeatsCount = $license->licenseSeats->filter(function ($seat) {
            return $seat->assigned_to_user_id !== null || $seat->assigned_to_asset_id !== null;
        })->count();

        $licenseData = [
            'id' => $license->id,
            'name' => $license->name,
            'product_key' => $license->product_key,
            'seats' => $totalSeats,
            'assigned_seats_count' => $assignedSeatsCount,
            'available_seats_count' => $totalSeats - $assignedSeatsCount,
            'purchase_cost' => $license->purchase_cost,
            'purchase_date' => $license->purchase_date ? $license->purchase_date->format('Y-m-d') : null,
            'expiration_date' => $license->expiration_date ? $license->expiration_date->format('Y-m-d') : null,
            'license_email' => $license->license_email,
            'license_name' => $license->license_name,
            'vendor' => $license->vendor ? $license->vendor->name : null,
            'vendor_id' => $license->vendor_id,
            'site' => $license->site ? $license->site->name : null,
            'site_id' => $license->site_id,
            'notes' => $license->notes,
            'created_at' => $license->created_at->format('Y-m-d H:i:s'),
            'seats_list' => $license->licenseSeats->map(function ($seat) {
                return [
                    'id' => $seat->id,
                    'seat_number' => $seat->seat_number,
                    'assigned_to_user_id' => $seat->assigned_to_user_id,
                    'assigned_user_name' => $seat->assignedUser ? $seat->assignedUser->name : null,
                    'assigned_user_email' => $seat->assignedUser ? $seat->assignedUser->email : null,
                    'assigned_to_asset_id' => $seat->assigned_to_asset_id,
                    'assigned_asset_name' => $seat->assignedAsset ? $seat->assignedAsset->product_name : null,
                    'assigned_asset_serial' => $seat->assignedAsset ? $seat->assignedAsset->serial_number : null,
                    'assigned_at' => $seat->assigned_at ? $seat->assigned_at->format('Y-m-d H:i:s') : null,
                    'notes' => $seat->notes,
                ];
            })->sortBy('seat_number')->values()->toArray(),
        ];

        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        
        $assets = Asset::with('site')->orderBy('product_name')->get()
            ->map(function($asset) {
                return [
                    'id' => $asset->id,
                    'name' => $asset->product_name . ' (' . ($asset->serial_number ?: 'No Serial') . ')',
                    'site' => $asset->site ? $asset->site->name : 'No Site',
                ];
            });

        $sites = DB::table('sites')->select('id', 'name')->orderBy('name')->get();
        $vendors = DB::table('vendors')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Licenses/Show', [
            'license' => $licenseData,
            'users' => $users,
            'assets' => $assets,
            'sites' => $sites,
            'vendors' => $vendors,
        ]);
    }

    public function update(Request $request, License $license)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        $error = DB::transaction(function () use ($license, $validated) {
            $oldSeatsCount = $license->licenseSeats()->count();
            $newSeatsCount = (int)$validated['seats'];

            if ($newSeatsCount < $oldSeatsCount) {
                // Check how many seats are currently assigned
                $assignedSeatsCount = $license->licenseSeats()
                    ->where(function($query) {
                        $query->whereNotNull('assigned_to_user_id')
                              ->orWhereNotNull('assigned_to_asset_id');
                    })->count();

                if ($assignedSeatsCount > $newSeatsCount) {
                    return "Cannot reduce seats to {$newSeatsCount}. There are currently {$assignedSeatsCount} checked-out seats.";
                }

                // Delete only unassigned seats
                $seatsToDelete = $license->licenseSeats()
                    ->whereNull('assigned_to_user_id')
                    ->whereNull('assigned_to_asset_id')
                    ->orderBy('seat_number', 'desc')
                    ->limit($oldSeatsCount - $newSeatsCount)
                    ->get();

                foreach ($seatsToDelete as $seat) {
                    $seat->delete();
                }

                // Sequential renumbering of remaining seats
                $remainingSeats = $license->licenseSeats()->orderBy('id')->get();
                foreach ($remainingSeats as $index => $seat) {
                    $seat->update(['seat_number' => $index + 1]);
                }
            } elseif ($newSeatsCount > $oldSeatsCount) {
                // Add new seats
                for ($i = $oldSeatsCount + 1; $i <= $newSeatsCount; $i++) {
                    LicenseSeat::create([
                        'license_id' => $license->id,
                        'seat_number' => $i,
                    ]);
                }
            }

            $license->update($validated);
            return null;
        });

        if ($error) {
            return redirect()->back()->with('error', $error);
        }

        return redirect()->route('licenses.index')->with('success', 'License updated successfully.');
    }

    public function destroy(License $license)
    {
        // Check if any seat is checked out
        $assignedSeatsCount = $license->licenseSeats()
            ->where(function($query) {
                $query->whereNotNull('assigned_to_user_id')
                      ->orWhereNotNull('assigned_to_asset_id');
            })->count();

        if ($assignedSeatsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete license. There are currently {$assignedSeatsCount} active assignments.");
        }

        $license->delete(); // This is soft delete

        return redirect()->route('licenses.index')->with('success', 'License deleted successfully.');
    }

    public function checkout(Request $request, LicenseSeat $seat)
    {
        $validated = $request->validate([
            'target_type' => 'required|in:user,asset',
            'user_id' => 'required_if:target_type,user|nullable|exists:users,id',
            'asset_id' => 'required_if:target_type,asset|nullable|exists:assets,id',
            'notes' => 'nullable|string',
        ]);

        if ($seat->assigned_to_user_id || $seat->assigned_to_asset_id) {
            return redirect()->back()->with('error', 'Seat is already checked out.');
        }

        if ($validated['target_type'] === 'user') {
            $seat->update([
                'assigned_to_user_id' => $validated['user_id'],
                'assigned_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);
        } else {
            $seat->update([
                'assigned_to_asset_id' => $validated['asset_id'],
                'assigned_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', 'License seat checked out successfully.');
    }

    public function checkin(LicenseSeat $seat)
    {
        if (!$seat->assigned_to_user_id && !$seat->assigned_to_asset_id) {
            return redirect()->back()->with('error', 'Seat is not checked out.');
        }

        $seat->update([
            'assigned_to_user_id' => null,
            'assigned_to_asset_id' => null,
            'assigned_at' => null,
            'notes' => null,
        ]);

        return redirect()->back()->with('success', 'License seat checked in successfully.');
    }
}
