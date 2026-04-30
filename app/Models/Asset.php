<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
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
}