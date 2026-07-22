<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;

class AssetStatus extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = ['name', 'color', 'sort_order'];
}
