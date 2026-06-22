<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomMasterDataType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function values()
    {
        return $this->hasMany(CustomMasterDataValue::class);
    }

    public function columns()
    {
        return $this->hasMany(CustomMasterDataColumn::class)->orderBy('sort_order');
    }
}
