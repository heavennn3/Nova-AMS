<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
    ];

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
