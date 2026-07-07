<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SparePartFieldValue extends Model
{
    protected $fillable = ['spare_part_id', 'column_key', 'value'];

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }
}
