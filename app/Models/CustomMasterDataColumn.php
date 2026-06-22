<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomMasterDataColumn extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_master_data_type_id',
        'name',
        'slug',
        'data_type',
        'is_required',
        'sort_order',
        'options',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'sort_order' => 'integer',
        'options' => 'array',
    ];

    public function type()
    {
        return $this->belongsTo(CustomMasterDataType::class, 'custom_master_data_type_id');
    }
}
