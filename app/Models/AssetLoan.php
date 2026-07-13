<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetLoan extends Model
{
    protected $fillable = [
        'asset_id',
        'user_id',
        'site_id',
        'loan_date',
        'expected_return_date',
        'condition_status',
        'purpose',
        'notes',
        'status',
        'approved_by',
        'approved_at',
        'returned_at',
        'return_proof_path',
    ];

    protected $casts = [
        'loan_date' => 'date',
        'expected_return_date' => 'date',
        'approved_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'approved')
            ->where('expected_return_date', '<', now());
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
