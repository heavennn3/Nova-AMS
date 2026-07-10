<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Site extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $fillable = ['name', 'code', 'region_id', 'is_active'];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function siteAdmin()
    {
        return $this->belongsTo(User::class, 'site_admin_id');
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('site_access', function ($builder) {
            $user = auth()->user();
            if ($user && !$user->hasRole('Admin') && $user->site_id) {
                $builder->where($builder->getQuery()->from . '.id', $user->site_id);
            }
        });
    }
}
