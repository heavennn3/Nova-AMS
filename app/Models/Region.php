<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = ['name'];

    public function sites()
    {
        return $this->hasMany(Site::class);
    }
}
