<?php

namespace App\Http\Controllers;

use App\Models\License;
use App\Models\LicenseSeat;
use App\Models\LicenseAssignment;
use App\Models\LicenseRenewal;
use App\Models\LicenseUsageLog;
use App\Models\User;
use App\Models\Asset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LicenseController extends Controller
{
    public function index()
    {
        try {
            Log::info('License index method called');

            $licenses = License::with(['vendor', 'site', 'licenseSeats'])
                ->get()
                ->map(function ($license) {
                    try {
                        $license->updateComplianceStatus();

                        return [
                            'id' => $license->id,
                            'name' => $license->name,
                            'product_key' => $license->product_key,
                            'version' => $license->version,
                            'category' => $license->category,
                            'license_type' => $license->license_type,
                            'pricing_model' => $license->pricing_model,
                            'total_seats' => $license->total_seats,
                            'used_seats' => $license->used_seats,
                            'available_seats' => $license->available_seats,
                            'purchase_cost' => $license->purchase_cost,
                            'purchase_date' => $license->purchase_date ? $license->purchase_date->format('Y-m-d') : null,
                            'expiration_date' => $license->expiration_date ? $license->expiration_date->format('Y-m-d') : null,
                            'support_expiry' => $license->support_expiry ? $license->support_expiry->format('Y-m-d') : null,
                            'renewal_date' => $license->renewal_date ? $license->renewal_date->format('Y-m-d') : null,
                            'auto_renew' => $license->auto_renew,
                            'subscription_id' => $license->subscription_id,
                            'billing_cycle' => $license->billing_cycle,
                            'compliance_status' => $license->compliance_status,
                            'license_email' => $license->license_email,
                            'license_name' => $license->license_name,
                            'vendor' => $license->vendor ? $license->vendor->name : null,
                            'vendor_id' => $license->vendor_id,
                            'site' => $license->site ? $license->site->name : null,
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

            Log::info('License page loaded successfully', [
                'licenses_count' => $licenses->count(),
                'users_count' => $users->count(),
                'assets_count' => $assets->count(),
                'sites_count' => $sites->count(),
                'vendors_count' => $vendors->count(),
            ]);

            return Inertia::render('Licenses/Index', [
                'licenses' => $licenses,
                'users' => $users,
                'assets' => $assets,
                'sites' => $sites,
                'vendors' => $vendors,
            ]);

        } catch (\Exception $e) {
            Log::error('License index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            // Return a simple error page
            return Inertia::render('Licenses/Simple', [
                'licenses' => [],
                'users' => [],
                'assets' => [],
                'sites' => [],
                'vendors' => [],
                'error' => 'Error loading licenses: ' . $e->getMessage(),
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_key' => 'nullable|string',
            'version' => 'nullable|string',
            'category' => 'nullable|string',
            'license_type' => 'required|in:per_user,per_device,concurrent,subscription,perpetual',
            'pricing_model' => 'required|in:one_time,annual,monthly,quarterly',
            'total_seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'support_expiry' => 'nullable|date',
            'renewal_date' => 'nullable|date',
            'auto_renew' => 'boolean',
            'subscription_id' => 'nullable|string',
            'billing_cycle' => 'nullable|in:monthly,quarterly,annual,custom',
            'notification_days' => 'nullable|integer|min:1|max:365',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            $licenseData = array_merge($validated, [
                'used_seats' => 0,
                'available_seats' => $validated['total_seats'],
                'compliance_status' => 'compliant',
            ]);

            $license = License::create($licenseData);

            // Generate Seats
            for ($i = 1; $i <= $validated['total_seats']; $i++) {
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
            $license->load(['vendor', 'site', 'licenseSeats.assignedUser', 'licenseSeats.assignedAsset']);
            $license->updateComplianceStatus();

            $formattedLicense = [
                'id' => $license->id,
                'name' => $license->name,
                'product_key' => $license->product_key,
                'version' => $license->version,
                'category' => $license->category,
                'license_type' => $license->license_type,
                'pricing_model' => $license->pricing_model,
                'purchase_cost' => $license->purchase_cost,
                'purchase_date' => $license->purchase_date ? $license->purchase_date->format('Y-m-d') : null,
                'expiration_date' => $license->expiration_date ? $license->expiration_date->format('Y-m-d') : null,
                'support_expiry' => $license->support_expiry ? $license->support_expiry->format('Y-m-d') : null,
                'renewal_date' => $license->renewal_date ? $license->renewal_date->format('Y-m-d') : null,
                'auto_renew' => $license->auto_renew,
                'subscription_id' => $license->subscription_id,
                'billing_cycle' => $license->billing_cycle,
                'compliance_status' => $license->compliance_status,
                'license_email' => $license->license_email,
                'license_name' => $license->license_name,
                'vendor' => $license->vendor ? $license->vendor->name : null,
                'vendor_id' => $license->vendor_id,
                'site' => $license->site ? $license->site->name : null,
                'site_id' => $license->site_id,
                'notes' => $license->notes,
                'seats' => $license->total_seats,
                'assigned_seats_count' => $license->used_seats,
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
                'users' => User::orderBy('name')->get(['id', 'name', 'email']),
                'assets' => Asset::with('site')->orderBy('product_name')->get()
                    ->map(function($asset) {
                        return [
                            'id' => $asset->id,
                            'name' => $asset->product_name . ' (' . ($asset->serial_number ?: 'No Serial') . ')',
                            'site' => $asset->site ? $asset->site->name : 'No Site',
                        ];
                    }),
                'sites' => DB::table('sites')->select('id', 'name')->orderBy('name')->get(),
                'vendors' => DB::table('vendors')->select('id', 'name')->orderBy('name')->get(),
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
            'product_key' => 'nullable|string',
            'version' => 'nullable|string',
            'category' => 'nullable|string',
            'license_type' => 'required|in:per_user,per_device,concurrent,subscription,perpetual',
            'pricing_model' => 'required|in:one_time,annual,monthly,quarterly',
            'total_seats' => 'required|integer|min:1|max:500',
            'purchase_cost' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'support_expiry' => 'nullable|date',
            'renewal_date' => 'nullable|date',
            'auto_renew' => 'boolean',
            'subscription_id' => 'nullable|string',
            'billing_cycle' => 'nullable|in:monthly,quarterly,annual,custom',
            'notification_days' => 'nullable|integer|min:1|max:365',
            'license_email' => 'nullable|email|max:255',
            'license_name' => 'nullable|string|max:255',
            'vendor_id' => 'nullable|exists:vendors,id',
            'site_id' => 'nullable|exists:sites,id',
            'notes' => 'nullable|string',
        ]);

        $error = DB::transaction(function () use ($license, $validated) {
            $oldSeatsCount = $license->licenseSeats()->count();
            $newSeatsCount = (int)$validated['total_seats'];

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

                $validated['available_seats'] = $newSeatsCount - $assignedSeatsCount;
            } elseif ($newSeatsCount > $oldSeatsCount) {
                for ($i = $oldSeatsCount + 1; $i <= $newSeatsCount; $i++) {
                    LicenseSeat::create([
                        'license_id' => $license->id,
                        'seat_number' => $i,
                        'seat_status' => 'available',
                    ]);
                }

                $validated['available_seats'] = $license->available_seats + ($newSeatsCount - $oldSeatsCount);
            }

            $license->update($validated);
            $license->updateComplianceStatus();
            return null;
        });

        if ($error) {
            return redirect()->back()->with('error', $error);
        }

        return redirect()->route('licenses.index')->with('success', 'License updated successfully.');
    }

    public function destroy(License $license)
    {
        $assignedSeatsCount = $license->licenseSeats()
            ->where('seat_status', 'assigned')
            ->count();

        if ($assignedSeatsCount > 0) {
            return redirect()->back()->with('error', "Cannot delete license. There are currently {$assignedSeatsCount} active assignments.");
        }

        $license->delete();

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

        if ($seat->seat_status === 'assigned') {
            return redirect()->back()->with('error', 'Seat is already checked out.');
        }

        $license = $seat->license;

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

    public function usageReport()
    {
        try {
            $licenses = License::with(['vendor', 'site', 'licenseSeats.assignedUser', 'licenseSeats.assignedAsset'])
                ->get()
                ->map(function ($license) {
                    $license->updateComplianceStatus();

                    return [
                        'id' => $license->id,
                        'name' => $license->name,
                        'license_type' => $license->license_type,
                        'total_seats' => $license->total_seats,
                        'used_seats' => $license->used_seats,
                        'available_seats' => $license->available_seats,
                        'compliance_status' => $license->compliance_status,
                        'utilization_percentage' => $license->total_seats > 0
                            ? round(($license->used_seats / $license->total_seats) * 100, 1)
                            : 0,
                        'vendor' => $license->vendor ? $license->vendor->name : null,
                        'assignments' => $license->licenseSeats->where('seat_status', 'assigned')->map(function ($seat) {
                            return [
                                'seat_number' => $seat->seat_number,
                                'assignment_type' => $seat->assignment_type,
                                'assigned_to' => $seat->assigned_to_user_id
                                    ? ($seat->assignedUser?->name ?? 'Unknown User')
                                    : ($seat->assignedAsset?->product_name ?? 'Unknown Asset'),
                                'assigned_at' => $seat->assigned_at?->format('Y-m-d H:i:s'),
                            ];
                        })->values()->toArray(),
                    ];
                });

            return Inertia::render('Licenses/UsageReport', [
                'licenses' => $licenses,
            ]);
        } catch (\Exception $e) {
            Log::error('Usage report error: ' . $e->getMessage());
            return back()->with('error', 'Error loading usage report.');
        }
    }

    public function renewals()
    {
        try {
            $licenses = License::with(['vendor', 'renewals'])
                ->whereNotNull('expiration_date')
                ->orderBy('expiration_date')
                ->get()
                ->map(function ($license) {
                    return [
                        'id' => $license->id,
                        'name' => $license->name,
                        'expiration_date' => $license->expiration_date?->format('Y-m-d'),
                        'renewal_date' => $license->renewal_date?->format('Y-m-d'),
                        'auto_renew' => $license->auto_renew,
                        'subscription_id' => $license->subscription_id,
                        'billing_cycle' => $license->billing_cycle,
                        'pricing_model' => $license->pricing_model,
                        'vendor' => $license->vendor ? $license->vendor->name : null,
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

    public function edit(License $license)
    {
        return redirect()->route('licenses.index');
    }
}