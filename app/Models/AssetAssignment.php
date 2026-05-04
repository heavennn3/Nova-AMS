<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetAssignment extends Model
{
    protected $fillable = [
        'asset_id',
        'user_id',
        'assigned_at',
        'returned_at',
        'status',
        'remarks',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Scope: only currently active (not returned) assignments */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
