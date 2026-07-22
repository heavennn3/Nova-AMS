<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class StatusLabel extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $table = 'status_labels';

    protected $fillable = [
        'name',
        'type',
        'notes',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
