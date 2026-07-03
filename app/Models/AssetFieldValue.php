<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetFieldValue extends Model
{
    protected $fillable = ['asset_id', 'column_key', 'value'];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
