<?php

namespace App\Http\Controllers;

use App\Models\PagePermission;
use App\Models\User;
use App\Models\UserPagePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PagePermissionController extends Controller
{
    /**
     * Display the page permissions management interface
     */
    public function index()
    {
        $pages = PagePermission::active()
            ->with('userPagePermissions.user')
            ->orderBy('module')
            ->orderBy('name')
            ->get();

        $users = User::with('pagePermissions.pagePermission')
            ->where('is_active', true)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name'),
                    'page_permissions' => $user->pagePermissions->map(function ($perm) {
                        return [
                            'page_name' => $perm->pagePermission->name,
                            'permissions' => $perm->granted_permissions,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/page-permissions', [
            'pages' => $pages,
            'users' => $users,
            'modules' => PagePermission::active()
                ->select('module')
                ->distinct()
                ->pluck('module')
                ->filter(),
        ]);
    }

    /**
     * Get permissions matrix for a specific user
     */
    public function getUserPermissions(Request $request, User $user)
    {
        $permissions = PagePermission::active()
            ->with(['userPagePermissions' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($page) {
                $userPerm = $page->userPagePermissions->first();

                return [
                    'id' => $page->id,
                    'name' => $page->name,
                    'route' => $page->route,
                    'description' => $page->description,
                    'module' => $page->module,
                    'permissions' => [
                        'can_create' => $userPerm ? $userPerm->can_create : false,
                        'can_read' => $userPerm ? $userPerm->can_read : false,
                        'can_update' => $userPerm ? $userPerm->can_update : false,
                        'can_delete' => $userPerm ? $userPerm->can_delete : false,
                    ],
                ];
            });

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
            ],
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update user's page permissions
     */
    public function updateUserPermissions(Request $request, User $user)
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*.page_permission_id' => 'required|exists:page_permissions,id',
            'permissions.*.can_create' => 'boolean',
            'permissions.*.can_read' => 'boolean',
            'permissions.*.can_update' => 'boolean',
            'permissions.*.can_delete' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->permissions as $permissionData) {
                $pagePermission = PagePermission::find($permissionData['page_permission_id']);

                if (!$pagePermission || !$pagePermission->active) {
                    continue;
                }

                // Check if any permission is granted
                $hasAnyPermission = $permissionData['can_create'] ||
                                   $permissionData['can_read'] ||
                                   $permissionData['can_update'] ||
                                   $permissionData['can_delete'];

                if ($hasAnyPermission) {
                    // Update or create the user page permission
                    UserPagePermission::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'page_permission_id' => $pagePermission->id,
                        ],
                        [
                            'can_create' => $permissionData['can_create'],
                            'can_read' => $permissionData['can_read'],
                            'can_update' => $permissionData['can_update'],
                            'can_delete' => $permissionData['can_delete'],
                        ]
                    );
                } else {
                    // Remove permission if all are false
                    UserPagePermission::where('user_id', $user->id)
                        ->where('page_permission_id', $pagePermission->id)
                        ->delete();
                }
            }

            DB::commit();

            return back()->with('success', 'Permissions updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update permissions: ' . $e->getMessage());
        }
    }

    /**
     * Bulk update permissions for multiple users
     */
    public function bulkUpdatePermissions(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'page_permission_id' => 'required|exists:page_permissions,id',
            'permissions' => 'required|array',
            'permissions.can_create' => 'boolean',
            'permissions.can_read' => 'boolean',
            'permissions.can_update' => 'boolean',
            'permissions.can_delete' => 'boolean',
        ]);

        $pagePermission = PagePermission::findOrFail($request->page_permission_id);

        if (!$pagePermission->active) {
            return back()->with('error', 'Page permission is not active.');
        }

        $hasAnyPermission = $request->permissions['can_create'] ||
                           $request->permissions['can_read'] ||
                           $request->permissions['can_update'] ||
                           $request->permissions['can_delete'];

        DB::beginTransaction();

        try {
            foreach ($request->user_ids as $userId) {
                if ($hasAnyPermission) {
                    UserPagePermission::updateOrCreate(
                        [
                            'user_id' => $userId,
                            'page_permission_id' => $pagePermission->id,
                        ],
                        [
                            'can_create' => $request->permissions['can_create'],
                            'can_read' => $request->permissions['can_read'],
                            'can_update' => $request->permissions['can_update'],
                            'can_delete' => $request->permissions['can_delete'],
                        ]
                    );
                } else {
                    UserPagePermission::where('user_id', $userId)
                        ->where('page_permission_id', $pagePermission->id)
                        ->delete();
                }
            }

            DB::commit();

            return back()->with('success', 'Bulk permissions updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update bulk permissions: ' . $e->getMessage());
        }
    }

    /**
     * Copy permissions from one user to another
     */
    public function copyPermissions(Request $request)
    {
        $request->validate([
            'from_user_id' => 'required|exists:users,id',
            'to_user_id' => 'required|exists:users,id|different:from_user_id',
        ]);

        $fromUser = User::findOrFail($request->from_user_id);
        $toUser = User::findOrFail($request->to_user_id);

        DB::beginTransaction();

        try {
            // Delete existing permissions for target user
            UserPagePermission::where('user_id', $toUser->id)->delete();

            // Copy permissions
            $fromPermissions = UserPagePermission::where('user_id', $fromUser->id)->get();

            foreach ($fromPermissions as $perm) {
                UserPagePermission::create([
                    'user_id' => $toUser->id,
                    'page_permission_id' => $perm->page_permission_id,
                    'can_create' => $perm->can_create,
                    'can_read' => $perm->can_read,
                    'can_update' => $perm->can_update,
                    'can_delete' => $perm->can_delete,
                ]);
            }

            DB::commit();

            return back()->with('success', 'Permissions copied successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to copy permissions: ' . $e->getMessage());
        }
    }

    /**
     * Get permission statistics
     */
    public function getStatistics()
    {
        $stats = [
            'total_pages' => PagePermission::active()->count(),
            'total_users_with_permissions' => UserPagePermission::distinct('user_id')->count('user_id'),
            'most_used_pages' => PagePermission::active()
                ->withCount('userPagePermissions')
                ->orderBy('user_page_permissions_count', 'desc')
                ->limit(10)
                ->get(),
            'users_with_no_permissions' => User::where('is_active', true)
                ->whereDoesntHave('pagePermissions')
                ->count(),
        ];

        return response()->json($stats);
    }
}