<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class LicenseSeat extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'license_id',
        'seat_number',
        'seat_status',
        'assignment_type',
        'assigned_to_user_id',
        'assigned_to_asset_id',
        'assigned_at',
        'last_used',
        'revoked_at',
        'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'last_used' => 'datetime',
        'revoked_at' => 'datetime',
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
