<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PagePermission extends Model
{
    protected $fillable = [
        'name',
        'route',
        'description',
        'module',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get all user permissions for this page
     */
    public function userPagePermissions(): HasMany
    {
        return $this->hasMany(UserPagePermission::class);
    }

    /**
     * Get all users who have permissions for this page
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_page_permissions')
            ->withPivot('can_create', 'can_read', 'can_update', 'can_delete')
            ->withTimestamps();
    }

    /**
     * Scope to only active pages
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Get pages by module
     */
    public function scopeByModule($query, $module)
    {
        return $query->where('module', $module);
    }
}