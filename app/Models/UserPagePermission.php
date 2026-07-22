<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPagePermission extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    protected $fillable = [
        'user_id',
        'page_permission_id',
        'can_create',
        'can_read',
        'can_update',
        'can_delete',
    ];

    protected $casts = [
        'can_create' => 'boolean',
        'can_read' => 'boolean',
        'can_update' => 'boolean',
        'can_delete' => 'boolean',
    ];

    /**
     * Get the user that owns the permission
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the page permission
     */
    public function pagePermission(): BelongsTo
    {
        return $this->belongsTo(PagePermission::class);
    }

    /**
     * Check if user has specific permission on this page
     */
    public function hasPermission(string $permission): bool
    {
        $permissionField = "can_{$permission}";
        return isset($this->$permissionField) && $this->$permissionField === true;
    }

    /**
     * Get all granted permissions as array
     */
    public function getGrantedPermissionsAttribute(): array
    {
        $permissions = [];
        foreach (['create', 'read', 'update', 'delete'] as $perm) {
            if ($this->{"can_{$perm}"}) {
                $permissions[] = $perm;
            }
        }
        return $permissions;
    }
}