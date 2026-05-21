<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class AssetTransfer extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'asset_id',
        'from_site_id',
        'to_site_id',
        'requested_by',
        'approved_by',
        'status',
        'transfer_date',
        'notes',
    ];

    protected $casts = [
        'transfer_date' => 'datetime',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function fromSite()
    {
        return $this->belongsTo(Site::class, 'from_site_id');
    }

    public function toSite()
    {
        return $this->belongsTo(Site::class, 'to_site_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
