<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetRequest extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_number',
        'user_id',
        'asset_id',
        'asset_category_id',
        'license_id',
        'request_type',
        'priority',
        'status',
        'required_from',
        'required_until',
        'reason',
        'approved_by',
        'approved_at',
        'admin_notes',
        'fulfilled_at',
        'returned_at',
        // Loan-specific fields
        'loan_date',
        'expected_return_date',
        'condition_status',
        'purpose',
    ];

    protected $casts = [
        'required_from' => 'date',
        'required_until' => 'date',
        'approved_at' => 'datetime',
        'fulfilled_at' => 'datetime',
        'returned_at' => 'datetime',
        'loan_date' => 'date',
        'expected_return_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(\App\Models\License::class);
    }
}
