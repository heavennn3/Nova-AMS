<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'email', 'password', 'site_id', 'phone', 'ic_number', 'profile_photo', 'is_active'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements Auditable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles, \OwenIt\Auditing\Auditable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * Get the sites associated with the user.
     */
    public function sites()
    {
        return $this->belongsToMany(Site::class);
    }

    /**
     * Get work orders assigned to this user (as technician)
     */
    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'assigned_to');
    }

    /**
     * Get all page permissions for this user
     */
    public function pagePermissions()
    {
        return $this->hasMany(UserPagePermission::class);
    }

    /**
     * Get all pages this user has permissions for
     */
    public function pages()
    {
        return $this->belongsToMany(PagePermission::class, 'user_page_permissions')
            ->withPivot('can_create', 'can_read', 'can_update', 'can_delete')
            ->withTimestamps();
    }

    /**
     * Check if user has specific CRUD permission on a page
     */
    public function hasPagePermission(string $pageName, string $permission): bool
    {
        // First check if super admin
        if ($this->hasRole('Admin')) {
            return true;
        }

        $pagePermission = $this->pagePermissions()
            ->whereHas('pagePermission', function ($query) use ($pageName) {
                $query->where('name', $pageName)->active();
            })
            ->first();

        if (!$pagePermission) {
            return false;
        }

        return $pagePermission->hasPermission($permission);
    }

    /**
     * Get all granted permissions for a specific page
     */
    public function getPagePermissions(string $pageName): array
    {
        if ($this->hasRole('Admin')) {
            return ['create', 'read', 'update', 'delete'];
        }

        $pagePermission = $this->pagePermissions()
            ->whereHas('pagePermission', function ($query) use ($pageName) {
                $query->where('name', $pageName)->active();
            })
            ->first();

        return $pagePermission ? $pagePermission->granted_permissions : [];
    }

    /**
     * Grant or revoke specific CRUD permission on a page
     */
    public function setPagePermission(string $pageName, string $permission, bool $grant): bool
    {
        $page = PagePermission::where('name', $pageName)->active()->first();

        if (!$page) {
            return false;
        }

        $userPagePerm = UserPagePermission::firstOrCreate(
            [
                'user_id' => $this->id,
                'page_permission_id' => $page->id,
            ],
            [
                'can_create' => false,
                'can_read' => false,
                'can_update' => false,
                'can_delete' => false,
            ]
        );

        $permissionField = "can_{$permission}";
        $userPagePerm->$permissionField = $grant;
        $userPagePerm->save();

        return true;
    }
}
