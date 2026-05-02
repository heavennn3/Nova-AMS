<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'region'];

    /**
     * Get the users assigned to the site.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
