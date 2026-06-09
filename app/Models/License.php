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
        'seats',
        'purchase_cost',
        'purchase_date',
        'expiration_date',
        'license_email',
        'license_name',
        'vendor_id',
        'site_id',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiration_date' => 'date',
        'seats' => 'integer',
        'purchase_cost' => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function licenseSeats()
    {
        return $this->hasMany(LicenseSeat::class);
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
