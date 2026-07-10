<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Oem extends Model
{
    protected $fillable = ['name'];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
