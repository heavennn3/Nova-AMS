<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomMasterDataValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_master_data_type_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function type()
    {
        return $this->belongsTo(CustomMasterDataType::class, 'custom_master_data_type_id');
    }
}
