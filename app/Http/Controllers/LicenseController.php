<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\LicenseSeat;
use App\Models\LicenseAssignment;
use App\Models\User;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LicenseController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('License index method called');

            $siteId = $request->query('site_id');

            if (!$siteId) {
                $firstSite = \App\Models\Site::orderBy('name')->first();
                if ($firstSite) {
                    return redirect()->to('/licenses?site_id=' . $firstSite->id);
                }
            }

            $licenses = License::with(['site', 'licenseSeats'])
                ->when($siteId, fn($q) => $q->where('site_id', $siteId))
                ->get()
                ->map(function ($license) {
                    try {
                        $license->updateStatus();

                        return [
                            'id' => $license->id,
                            'name' => $license->name,
                            'license_key' => $license->license_key,
                            'category' => $license->category,
                            'type' => $license->type,
                            'total_seat' => $license->total_seat,
                            'used_seat' => $license->used_seat,
                            'available_seats' => $license->available_seats,
                            'active_date' => $license->active_date?->format('Y-m-d'),
                            'end_date' => $license->end_date?->format('Y-m-d'),
                            'status' => $license->status,
                            'site' => $license->site?->name,
                            'site_id' => $license->site_id,
                            'notes' => $license->notes,
                            'created_at' => $license->created_at->format('Y-m-d H:i:s'),
                        ];
                    } catch (\Exception $e) {
                        Log::error('Error processing license: ' . $e->getMessage(), ['license_id' => $license->id]);
                        return null;
                    }
                })->filter()->values();

            $users = User::orderBy('name')->get(['id', 'name', 'email']);

            $assets = Asset::with('site')->orderBy('id')->get()
                ->map(function($asset) {
                    return [
                        'id' => $asset->id,
                        'name' => $asset->product_name . ' (' . ($asset->serial_number ?: 'No Serial') . ')',
                        'site' => $asset->site ? $asset->site->name : 'No Site',
                    ];
                });

            $sites = DB::table('sites')->select('id', 'name')->orderBy('name')->get();

            Log::info('License page loaded successfully', [
                'licenses_count' => $licenses->count(),
                'users_count' => $users->count(),
                'assets_count' => $assets->count(),
                'sites_count' => $sites->count(),
            ]);

            return Inertia::render('Licenses/Index', [
                'licenses' => $licenses,
                'users' => $users,
                'assets' => $assets,
                'sites' => $sites,
                'currentSiteId' => $siteId ? (int)$siteId : null,
            ]);

        } catch (\Exception $e) {
            Log::error('License index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            // Return a simple error page
            return Inertia::render('Licenses/Index', [
                'licenses' => [],
                'users' => [],
                'assets' => [],
                'sites' => [],
                'currentSiteId' => null,
                'error' => 'Error loading licenses: ' . $e->getMessage(),
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'type' => 'nullable|string',
            'total_seat' => 'required|integer|min:1|max:500',
            'site_id' => 'nullable|exists:sites,id',
            'license_key' => 'nullable|string',
            'active_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $licenseData = array_merge($validated, [
                'used_seat' => 0,
                'status' => 'available',
            ]);

            $license = License::create($licenseData);

            // Generate Seats
            for ($i = 1; $i <= $validated['total_seat']; $i++) {
                LicenseSeat::create([
                    'license_id' => $license->id,
                    'seat_number' => $i,
                    'seat_status' => 'available',
                ]);
            }
        });

        return redirect()->route('licenses.index')->with('success', 'License created successfully.');
    }

    public function show(License $license)
    {
        try {
            $license->load(['site', 'licenseSeats.assignedUser', 'licenseSeats.assignedAsset']);
            $license->updateStatus();

            $formattedLicense = [
                'id' => $license->id,
                'name' => $license->name,
                'license_key' => $license->license_key,
                'category' => $license->category,
                'type' => $license->type,
                'total_seat' => $license->total_seat,
                'used_seat' => $license->used_seat,
                'available_seats' => $license->available_seats,
                'active_date' => $license->active_date?->format('Y-m-d'),
                'end_date' => $license->end_date?->format('Y-m-d'),
                'status' => $license->status,
                'site' => $license->site?->name,
                'site_id' => $license->site_id,
                'notes' => $license->notes,
                'seats' => $license->total_seat,
                'assigned_seats_count' => $license->used_seat,
                'available_seats_count' => $license->available_seats,
                'seats_list' => $license->licenseSeats->map(function ($seat) {
                    return [
                        'id' => $seat->id,
                        'seat_number' => $seat->seat_number,
                        'seat_status' => $seat->seat_status,
                        'assignment_type' => $seat->assignment_type,
                        'assigned_to_user_id' => $seat->assigned_to_user_id,
                        'assigned_to_asset_id' => $seat->assigned_to_asset_id,
                        'assigned_user_name' => $seat->assignedUser?->name,
                        'assigned_user_email' => $seat->assignedUser?->email,
                        'assigned_asset_name' => $seat->assignedAsset?->product_name,
                        'assigned_asset_serial' => $seat->assignedAsset?->serial_number,
                        'assigned_at' => $seat->assigned_at ? $seat->assigned_at->format('Y-m-d H:i:s') : null,
                        'notes' => $seat->notes,
                    ];
                })->values()->toArray(),
            ];

            return Inertia::render('Licenses/Show', [
                'license' => $formattedLicense,
                'users' => User::with('site')->orderBy('name')->get(['id', 'name', 'email', 'site_id'])
                    ->map(function ($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'site' => $u->site ? $u->site->name : 'No Site',
                        ];
                    }),
                'assets' => Asset::with('site')->orderBy('product_name')->get()
                    ->map(function($asset) {
                        return [
                            'id' => $asset->id,
                            'name' => $asset->product_name . ' (' . ($asset->serial_number ?: 'No Serial') . ')',
                            'site' => $asset->site ? $asset->site->name : 'No Site',
                        ];
                    }),
                'sites' => \App\Models\Site::orderBy('name')->get(['id', 'name']),
            ]);
        } catch (\Exception $e) {
            Log::error('License show error: ' . $e->getMessage());
            return back()->with('error', 'Error loading license details.');
        }
    }

    public function update(Request $request, License $license)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'type' => 'nullable|string',
            'total_seat' => 'required|integer|min:1|max:500',
            'site_id' => 'nullable|exists:sites,id',
            'license_key' => 'nullable|string',
            'active_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $error = DB::transaction(function () use ($license, $validated) {
            $oldSeatsCount = $license->licenseSeats()->count();
            $newSeatsCount = (int)$validated['total_seat'];

            if ($newSeatsCount < $oldSeatsCount) {
                $assignedSeatsCount = $license->licenseSeats()
                    ->where('seat_status', 'assigned')
                    ->count();

                if ($assignedSeatsCount > $newSeatsCount) {
                    return "Cannot reduce seats to {$newSeatsCount}. There are currently {$assignedSeatsCount} checked-out seats.";
                }

                $seatsToDelete = $license->licenseSeats()
                    ->where('seat_status', 'available')
                    ->orderBy('seat_number', 'desc')
                    ->limit($oldSeatsCount - $newSeatsCount)
                    ->get();

                foreach ($seatsToDelete as $seat) {
                    $seat->delete();
                }
            } elseif ($newSeatsCount > $oldSeatsCount) {
                for ($i = $oldSeatsCount + 1; $i <= $newSeatsCount; $i++) {
                    LicenseSeat::create([
                        'license_id' => $license->id,
                        'seat_number' => $i,
                        'seat_status' => 'available',
                    ]);
                }
            }

            $license->update($validated);
            $license->updateStatus();
            return null;
        });

        if ($error) {
            return redirect()->back()->with('error', $error);
        }

        return redirect()->route('licenses.index')->with('success', 'License updated successfully.');
    }

    public function destroy(Request $request, License $license)
    {
        $validated = $request->validate([
            'delete_reason' => 'required|string|max:1000',
        ]);

        $assignedSeatsCount = $license->licenseSeats()
            ->where('seat_status', 'assigned')
            ->count();

        if ($assignedSeatsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete license. There are currently {$assignedSeatsCount} active assignments.");
        }

        $license->delete_reason = $validated['delete_reason'];
        $license->save();
        $license->delete();

        return redirect()->route('licenses.index')->with('success', 'License deleted successfully.');
    }

    public function trash()
    {
        $licenses = License::onlyTrashed()->with(['vendor', 'site'])->get()->map(function ($license) {
            return [
                'id' => $license->id,
                'name' => $license->name,
                'product_key' => $license->product_key,
                'total_seats' => $license->total_seats,
                'purchase_cost' => $license->purchase_cost,
                'vendor' => $license->vendor ? $license->vendor->name : null,
                'site' => $license->site ? $license->site->name : null,
                'deleted_at' => $license->deleted_at->format('Y-m-d H:i:s'),
                'delete_reason' => $license->delete_reason,
            ];
        });

        return Inertia::render('Licenses/Trash', [
            'licenses' => $licenses,
        ]);
    }

    public function restore($id)
    {
        $license = License::onlyTrashed()->findOrFail($id);
        $license->delete_reason = null;
        $license->save();
        $license->restore();

        return redirect()->route('licenses.trash')->with('success', 'License restored successfully.');
    }

    public function forceDelete($id)
    {
        $license = License::onlyTrashed()->findOrFail($id);

        // Optional: you might want to force delete associated seats as well
        $license->licenseSeats()->forceDelete();
        $license->assignments()->forceDelete();

        $license->forceDelete();

        return redirect()->route('licenses.trash')->with('success', 'License permanently deleted.');
    }

    public function checkout(Request $request, LicenseSeat $seat)
    {
        $validated = $request->validate([
            'target_type' => 'required|in:user,asset',
            'user_id' => 'required_if:target_type,user|nullable|exists:users,id',
            'asset_id' => 'required_if:target_type,asset|nullable|exists:assets,id',
            'notes' => 'nullable|string',
        ]);

        if ($seat->seat_status === 'assigned') {
            return redirect()->back()->with('error', 'Seat is already checked out.');
        }

        $license = $seat->license;

        if ($validated['target_type'] === 'user') {
            $existing = LicenseSeat::where('license_id', $license->id)
                ->where('seat_status', 'assigned')
                ->where('assigned_to_user_id', $validated['user_id'])
                ->exists();

            if ($existing) {
                return redirect()->back()->with('error', 'This user already has a seat assigned for this license.');
            }
        }

        DB::transaction(function () use ($seat, $validated, $license) {
            $assignmentType = $validated['target_type'] === 'user' ? 'user' : 'device';

            $seatData = [
                'seat_status' => 'assigned',
                'assignment_type' => $assignmentType,
                'assigned_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ];

            if ($validated['target_type'] === 'user') {
                $seatData['assigned_to_user_id'] = $validated['user_id'];
            } else {
                $seatData['assigned_to_asset_id'] = $validated['asset_id'];
            }

            $seat->update($seatData);

            $license->assignments()->create([
                'license_seat_id' => $seat->id,
                'assigned_to_user_id' => $validated['target_type'] === 'user' ? $validated['user_id'] : null,
                'assigned_to_asset_id' => $validated['target_type'] === 'asset' ? $validated['asset_id'] : null,
                'assignment_type' => $assignmentType,
                'assigned_at' => now(),
                'assignment_notes' => $validated['notes'] ?? null,
            ]);

            $license->increment('used_seats');
            $license->updateComplianceStatus();
        });

        return redirect()->back()->with('success', 'License seat checked out successfully.');
    }

    public function checkin(Request $request, LicenseSeat $seat)
    {
        if ($seat->seat_status !== 'assigned') {
            return redirect()->back()->with('error', 'Seat is not checked out.');
        }

        $license = $seat->license;

        DB::transaction(function () use ($seat, $license, $request) {
            $assignment = $license->assignments()
                ->where('license_seat_id', $seat->id)
                ->whereNull('revoked_at')
                ->first();

            if ($assignment) {
                $assignment->update([
                    'revoked_at' => now(),
                    'revoked_by_user_id' => $request->user()?->id,
                ]);
            }

            $seat->update([
                'seat_status' => 'available',
                'assigned_to_user_id' => null,
                'assigned_to_asset_id' => null,
                'assignment_type' => null,
                'revoked_at' => now(),
            ]);

            $license->decrement('used_seats');
            $license->updateComplianceStatus();
        });

        return redirect()->back()->with('success', 'License seat checked in successfully.');
    }


    public function renewals()
    {
        try {
            $licenses = License::with(['renewals'])
                ->whereNotNull('end_date')
                ->orderBy('end_date')
                ->get()
                ->map(function ($license) {
                    return [
                        'id' => $license->id,
                        'name' => $license->name,
                        'end_date' => $license->end_date?->format('Y-m-d'),
                        'status' => $license->status,
                        'type' => $license->type,
                        'renewals_history' => $license->renewals->map(function ($renewal) {
                            return [
                                'id' => $renewal->id,
                                'previous_expiration' => $renewal->previous_expiration?->format('Y-m-d'),
                                'new_expiration' => $renewal->new_expiration?->format('Y-m-d'),
                                'renewal_cost' => $renewal->renewal_cost,
                                'renewal_type' => $renewal->renewal_type,
                                'renewed_at' => $renewal->created_at?->format('Y-m-d'),
                                'renewed_by' => $renewal->renewedBy?->name,
                            ];
                        })->sortByDesc('created_at')->values()->toArray(),
                    ];
                });

            return Inertia::render('Licenses/Renewals', [
                'licenses' => $licenses,
            ]);
        } catch (\Exception $e) {
            Log::error('Renewals error: ' . $e->getMessage());
            return back()->with('error', 'Error loading renewals.');
        }
    }

    public function recordRenewal(Request $request, License $license)
    {
        $validated = $request->validate([
            'new_expiration' => 'required|date',
            'renewal_cost' => 'nullable|numeric|min:0',
            'renewal_type' => 'required|in:automatic,manual,upgrade,downgrade',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($license, $validated) {
            $license->renewals()->create([
                'previous_expiration' => $license->expiration_date,
                'new_expiration' => $validated['new_expiration'],
                'renewal_cost' => $validated['renewal_cost'],
                'renewal_type' => $validated['renewal_type'],
                'notes' => $validated['notes'],
                'renewed_by_user_id' => $request->user()->id,
            ]);

            $license->update([
                'expiration_date' => $validated['new_expiration'],
                'renewal_date' => now()->toDateString(),
            ]);

            $license->updateComplianceStatus();
        });

        return redirect()->back()->with('success', 'License renewal recorded successfully.');
    }

    public function create()
    {
        return redirect()->route('licenses.index');
    }

    public function importBulk(Request $request)
    {
        $request->validate([
            'licenses' => 'required|array',
            'site_id' => 'nullable|integer|exists:sites,id',
        ]);

        $errors = [];
        $imported = 0;
        $requestSiteId = $request->site_id;

        foreach ($request->licenses as $idx => $row) {
            $line = $idx + 2;
            try {
                $normalized = [];
                foreach ($row as $k => $v) {
                    $normalized[preg_replace('/\s+/', '_', strtolower(trim($k)))] = trim((string)$v);
                }

                $data = [
                    'name' => $normalized['name'] ?? null,
                    'license_key' => $normalized['license_key'] ?? null,
                    'category' => $normalized['category'] ?? null,
                    'type' => $normalized['type'] ?? null,
                    'total_seat' => (int)($normalized['total_seat'] ?? 0),
                    'used_seat' => (int)($normalized['used_seat'] ?? 0),
                    'active_date' => $normalized['active_date'] ?? null,
                    'end_date' => $normalized['end_date'] ?? null,
                    'site_id' => !empty($normalized['site_id']) ? (int)$normalized['site_id'] : $requestSiteId,
                    'status' => $normalized['status'] ?? 'available',
                ];

                if (empty($data['name'])) {
                    $errors[] = "Row {$line}: name is required";
                    continue;
                }
                if ($data['total_seat'] < 1) {
                    $errors[] = "Row {$line}: total_seat must be >= 1";
                    continue;
                }

                DB::transaction(function () use ($data) {
                    $license = License::create($data);

                    for ($i = 1; $i <= $data['total_seat']; $i++) {
                        LicenseSeat::create([
                            'license_id' => $license->id,
                            'seat_number' => $i,
                            'seat_status' => $i <= $data['used_seat'] ? 'assigned' : 'available',
                        ]);
                    }
                });

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$line}: {$e->getMessage()}";
            }
        }

        return redirect()->route('licenses.index')->with(
            $errors ? 'warning' : 'success',
            $errors
                ? "Imported {$imported} licenses with " . count($errors) . " errors."
                : "Successfully imported {$imported} licenses."
        );
    }

    public function edit(License $license)
    {
        return redirect()->route('licenses.index');
    }
}