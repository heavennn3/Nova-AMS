<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable, SoftDeletes;
    protected $fillable = [
        'asset_id',
        'serial_number',
        'category_id',
        'type_id',
        'product_name',
        'brand',
        'vendor_id',
        'purchase_year',
        'location_id',
        'status',
        'condition_status',
        'notes',
        'latitude',
        'longitude',
        'quantity',
        'site_id',
        'image_path',
        'asset_name',
        'warranty_months',
        'order_number',
        'purchase_date',
        'eol_date',
        'supplier_id',
        'purchase_cost',
        'status_label_id',
    ];

    public function category()
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function type()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function statusLabel()
    {
        return $this->belongsTo(StatusLabel::class);
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
                    // Fallback to legacy single site_id column
                    $builder->where($builder->getQuery()->from . '.site_id', $user->site_id);
                }
            }
        });
    }

    /** The currently active (in-use) assignment, if any. */
    public function activeAssignment()
    {
        return $this->hasOne(AssetAssignment::class)->where('status', 'active')->latest();
    }

    /** All assignment history. */
    public function assignments()
    {
        return $this->hasMany(AssetAssignment::class)->latest();
    }
}