<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenseRenewal extends Model
{
    protected $fillable = [
        'license_id',
        'previous_expiration',
        'new_expiration',
        'renewal_cost',
        'renewal_type',
        'notes',
        'renewed_by_user_id',
    ];

    protected $casts = [
        'previous_expiration' => 'date',
        'new_expiration' => 'date',
        'renewal_cost' => 'decimal:2',
    ];

    public function license()
    {
        return $this->belongsTo(License::class);
    }

    public function renewedBy()
    {
        return $this->belongsTo(User::class, 'renewed_by_user_id');
    }
}