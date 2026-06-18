<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class SparePart extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'part_number',
        'category',
        'stock_level',
        'minimum_stock_level',
        'unit_cost',
        'location',
        'site_id',
        'status',
        'specifications',
        'compatibility',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'specifications' => 'array',
        'compatibility' => 'array',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function checkout()
    {
        return $this->hasMany(Checkout::class);
    }

    public function getAvailabilityAttribute()
    {
        if ($this->stock_level <= $this->minimum_stock_level) {
            return 'low';
        } elseif ($this->stock_level == 0) {
            return 'out_of_stock';
        }
        return 'available';
    }

    public function getTotalValueAttribute()
    {
        return $this->stock_level * $this->unit_cost;
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
