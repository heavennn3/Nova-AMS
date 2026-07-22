<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class LicenseRenewal extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'license_id',
        'previous_expiration',
        'new_expiration',
        'renewal_date',
        'notes',
        'renewed_by_user_id',
    ];

    protected $casts = [
        'previous_expiration' => 'date',
        'new_expiration' => 'date',
        'renewal_date' => 'date',
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