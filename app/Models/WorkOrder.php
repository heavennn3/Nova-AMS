<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class WorkOrder extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'asset_id',
        'reported_by',
        'assigned_to',
        'issue',
        'status',
        'priority',
        'reported_at',
        'completed_at',
    ];

    protected $casts = [
        'reported_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
