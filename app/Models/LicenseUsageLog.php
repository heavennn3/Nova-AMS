<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenseUsageLog extends Model
{
    protected $fillable = [
        'license_id',
        'license_seat_id',
        'user_id',
        'asset_id',
        'session_start',
        'session_end',
        'ip_address',
        'user_agent',
        'duration_minutes',
    ];

    protected $casts = [
        'session_start' => 'datetime',
        'session_end' => 'datetime',
    ];

    public function license()
    {
        return $this->belongsTo(License::class);
    }

    public function licenseSeat()
    {
        return $this->belongsTo(LicenseSeat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Calculate session duration
     */
    public function calculateDuration(): ?int
    {
        if (!$this->session_end) return null;

        return $this->session_start->diffInMinutes($this->session_end);
    }

    /**
     * Scope to get active sessions
     */
    public function scopeActive($query)
    {
        return $query->whereNull('session_end');
    }

    /**
     * Scope to get concurrent usage count
     */
    public function scopeConcurrentCount($query, $licenseId)
    {
        return $query->where('license_id', $licenseId)
            ->active()
            ->count();
    }
}