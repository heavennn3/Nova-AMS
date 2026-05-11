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
        'stock_level',
        'minimum_stock_level',
        'unit_cost',
        'site_id',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }
}
