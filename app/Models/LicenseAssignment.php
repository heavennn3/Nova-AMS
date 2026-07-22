<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class LicenseAssignment extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'license_id',
        'license_seat_id',
        'assigned_to_user_id',
        'assigned_to_asset_id',
        'assignment_type',
        'assigned_at',
        'revoked_at',
        'assignment_notes',
        'revoked_by_user_id',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function license()
    {
        return $this->belongsTo(License::class);
    }

    public function licenseSeat()
    {
        return $this->belongsTo(LicenseSeat::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assignedAsset()
    {
        return $this->belongsTo(Asset::class, 'assigned_to_asset_id');
    }

    public function revokedBy()
    {
        return $this->belongsTo(User::class, 'revoked_by_user_id');
    }

    /**
     * Check if assignment is currently active
     */
    public function isActive(): bool
    {
        return is_null($this->revoked_at);
    }

    /**
     * Scope to get only active assignments
     */
    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at');
    }
}