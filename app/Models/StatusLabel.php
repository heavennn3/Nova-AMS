<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusLabel extends Model
{
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
