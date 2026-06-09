<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenseSeat extends Model
{
    protected $fillable = [
        'license_id',
        'seat_number',
        'assigned_to_user_id',
        'assigned_to_asset_id',
        'assigned_at',
        'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function license()
    {
        return $this->belongsTo(License::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assignedAsset()
    {
        return $this->belongsTo(Asset::class, 'assigned_to_asset_id');
    }
}
