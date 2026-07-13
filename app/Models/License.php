<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class License extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'type',
        'total_seat',
        'used_seat',
        'site_id',
        'license_key',
        'active_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'active_date' => 'date',
        'end_date' => 'date',
        'total_seat' => 'integer',
        'used_seat' => 'integer',
    ];

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
        return max(0, ($this->total_seat ?? 0) - ($this->used_seat ?? 0));
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        if (!$this->end_date) return false;
        return $this->end_date->lte(now()->addDays($days)) && $this->end_date->gt(now());
    }

    public function isExpired(): bool
    {
        if (!$this->end_date) return false;
        return $this->end_date->lt(now());
    }

    public function isFull(): bool
    {
        return $this->used_seat >= $this->total_seat;
    }

    public function computeStatus(): string
    {
        if ($this->isExpired()) return 'expired';
        if ($this->isExpiringSoon()) return 'expiring_soon';
        if ($this->isFull()) return 'full';
        return 'available';
    }

    public function updateStatus(): void
    {
        $newStatus = $this->computeStatus();
        if ($this->status !== $newStatus) {
            $this->status = $newStatus;
            $this->saveQuietly();
        }
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
        $this->increment('used_seat');
        $this->updateStatus();

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
        $this->decrement('used_seat');
        $this->updateStatus();
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
