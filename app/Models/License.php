<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class License extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'product_key',
        'version',
        'category',
        'license_type',
        'license_type_id',
        'pricing_model',
        'total_seats',
        'used_seats',
        'available_seats',
        'purchase_date',
        'expiration_date',
        'support_expiry',
        'renewal_date',
        'auto_renew',
        'subscription_id',
        'billing_cycle',
        'compliance_status',
        'last_audit_date',
        'notification_days',
        'license_email',
        'license_name',
        'vendor_id',
        'site_id',
        'notes',
        'delete_reason',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiration_date' => 'date',
        'support_expiry' => 'date',
        'renewal_date' => 'date',
        'last_audit_date' => 'date',
        'total_seats' => 'integer',
        'used_seats' => 'integer',
        'available_seats' => 'integer',
        'auto_renew' => 'boolean',
        'notification_days' => 'integer',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function licenseType()
    {
        return $this->belongsTo(LicenseType::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function licenseSeats()
    {
        return $this->hasMany(LicenseSeat::class);
    }

    public function assignments()
    {
        return $this->hasMany(LicenseAssignment::class);
    }

    public function renewals()
    {
        return $this->hasMany(LicenseRenewal::class);
    }

    public function usageLogs()
    {
        return $this->hasMany(LicenseUsageLog::class);
    }

    /**
     * Get available seats count
     */
    public function getAvailableSeatsAttribute(): int
    {
        return max(0, $this->total_seats - $this->used_seats);
    }

    /**
     * Check if license is expiring soon
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        if (!$this->expiration_date) return false;

        return $this->expiration_date->lte(now()->addDays($days))
            && $this->expiration_date->gt(now());
    }

    /**
     * Check if license is expired
     */
    public function isExpired(): bool
    {
        if (!$this->expiration_date) return false;

        return $this->expiration_date->lt(now());
    }

    /**
     * Check if license is compliant
     */
    public function isCompliant(): bool
    {
        return !$this->isExpired() && $this->used_seats <= $this->total_seats;
    }

    /**
     * Update compliance status
     */
    public function updateComplianceStatus(): void
    {
        if ($this->isExpired()) {
            $this->compliance_status = 'expired';
        } elseif ($this->isExpiringSoon($this->notification_days)) {
            $this->compliance_status = 'expiring_soon';
        } elseif ($this->used_seats > $this->total_seats) {
            $this->compliance_status = 'non_compliant';
        } else {
            $this->compliance_status = 'compliant';
        }
        $this->save();
    }

    /**
     * Assign license to user or asset
     */
    public function assignTo($assignee, string $assignmentType, ?string $notes = null): LicenseSeat
    {
        if ($this->available_seats <= 0) {
            throw new \Exception('No available seats for this license');
        }

        $seat = $this->licenseSeats()
            ->where('seat_status', 'available')
            ->firstOr(function () {
                return $this->licenseSeats()->create([
                    'seat_number' => $this->licenseSeats()->max('seat_number') + 1,
                    'seat_status' => 'available',
                ]);
            });

        $assignmentData = [
            'seat_status' => 'assigned',
            'assignment_type' => $assignmentType,
            'assigned_at' => now(),
            'notes' => $notes,
        ];

        if ($assignmentType === 'user' && $assignee instanceof \App\Models\User) {
            $assignmentData['assigned_to_user_id'] = $assignee->id;
        } elseif ($assignmentType === 'device' && $assignee instanceof Asset) {
            $assignmentData['assigned_to_asset_id'] = $assignee->id;
        }

        $seat->update($assignmentData);

        // Create assignment record
        $this->assignments()->create([
            'license_seat_id' => $seat->id,
            'assigned_to_user_id' => $assignmentType === 'user' && $assignee instanceof \App\Models\User ? $assignee->id : null,
            'assigned_to_asset_id' => $assignmentType === 'device' && $assignee instanceof Asset ? $assignee->id : null,
            'assignment_type' => $assignmentType,
            'assigned_at' => now(),
            'assignment_notes' => $notes,
        ]);

        // Update seat counts
        $this->increment('used_seats');
        $this->updateComplianceStatus();

        return $seat;
    }

    /**
     * Revoke license assignment
     */
    public function revokeAssignment(LicenseSeat $seat, ?\App\Models\User $revokedBy = null): void
    {
        if ($seat->license_id !== $this->id) {
            throw new \Exception('Seat does not belong to this license');
        }

        $seat->update([
            'seat_status' => 'available',
            'assigned_to_user_id' => null,
            'assigned_to_asset_id' => null,
            'assignment_type' => null,
            'revoked_at' => now(),
        ]);

        // Update assignment record
        $assignment = $this->assignments()
            ->where('license_seat_id', $seat->id)
            ->whereNull('revoked_at')
            ->first();

        if ($assignment) {
            $assignment->update([
                'revoked_at' => now(),
                'revoked_by_user_id' => $revokedBy?->id,
            ]);
        }

        // Update seat counts
        $this->decrement('used_seats');
        $this->updateComplianceStatus();
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('site_access', function ($builder) {
            $user = auth()->user();
            if ($user && !$user->hasRole('Admin')) {
                $siteIds = $user->sites()->pluck('sites.id')->toArray();
                if (!empty($siteIds)) {
                    $builder->whereIn($builder->getQuery()->from . '.site_id', $siteIds);
                } elseif ($user->site_id) {
                    $builder->where($builder->getQuery()->from . '.site_id', $user->site_id);
                }
            }
        });
    }
}
