<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparePartCategory extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function spareParts()
    {
        return $this->hasMany(SparePart::class, 'spare_part_category_id');
    }
}
