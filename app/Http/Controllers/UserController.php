<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get()
            ->filter(fn($user) => !$user->hasRole('Admin'))
            ->map(function ($user) {
                $roleName = $user->roles->pluck('name')->first() ?? 'None';

                // Map role name to ID for frontend compatibility
                $roleMap = [
                    'Admin' => '1',
                    'Manager' => '2',
                    'Employee' => '3',
                ];
                $roleId = $roleMap[$roleName] ?? '3';

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $roleId,
                    'role' => $roleName,
                    'site_id' => $user->site_id,
                    'site_name' => $user->site?->name,
                    'is_active' => (bool) $user->is_active,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            })->values();

        $sites = \DB::table('sites')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'sites' => $sites,
            'roles' => ['Admin', 'Manager', 'Employee'],
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => ['Admin', 'Manager', 'Employee'],
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $roleMap = [
            '1' => 'Admin',
            '2' => 'Manager',
            '3' => 'Employee',
        ];

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|in:1,2,3',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'site_id' => $validated['site_id'] ?? null,
        ];

        $user = User::create($userData);

        $roleName = $roleMap[$validated['role_id']];
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        $user->assignRole($role);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $roleName = $user->roles->pluck('name')->first() ?? 'Employee';
        $roleMap = [
            'Admin' => '1',
            'Manager' => '2',
            'Employee' => '3',
        ];
        $roleId = $roleMap[$roleName] ?? '3';

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $roleId,
                'role' => $roleName,
                'site_id' => $user->site_id,
            ],
            'roles' => ['Admin', 'Manager', 'Employee'],
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $roleMap = [
            '1' => 'Admin',
            '2' => 'Manager',
            '3' => 'Employee',
        ];

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|in:1,2,3',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->site_id = $validated['site_id'] ?? null;
        $user->role_id = $validated['role_id'];

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        $roleName = $roleMap[$validated['role_id']];
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        $user->syncRoles([$role]);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->hasRole('Admin')) {
            return redirect()->back()->with('error', 'Cannot delete Admin users.');
        }
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function toggleActive(User $user)
    {
        if ($user->hasRole('Admin')) {
            return redirect()->back()->with('error', 'Cannot change status of Admin users.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'activated' : 'deactivated';
        return redirect()->route('users.index')->with('success', "User {$status} successfully.");
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
            'action' => 'required|in:activate,deactivate,delete,role,site',
            'role_id' => 'nullable|in:1,2,3',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])->get();
        $action = $validated['action'];
        $count = 0;

        $roleMap = [
            '1' => 'Admin',
            '2' => 'Manager',
            '3' => 'Employee',
        ];

        foreach ($users as $user) {
            // Skip admin users for bulk operations
            if ($user->hasRole('Admin')) {
                continue;
            }

            switch ($action) {
                case 'activate':
                    $user->is_active = true;
                    $user->save();
                    $count++;
                    break;
                case 'deactivate':
                    $user->is_active = false;
                    $user->save();
                    $count++;
                    break;
                case 'delete':
                    $user->delete();
                    $count++;
                    break;
                case 'role':
                    if (isset($validated['role_id'])) {
                        $roleName = $roleMap[$validated['role_id']];
                        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
                        $user->syncRoles([$role]);
                        $count++;
                    }
                    break;
                case 'site':
                    $user->site_id = $validated['site_id'] ?? null;
                    $user->save();
                    $count++;
                    break;
            }
        }

        $message = match($action) {
            'activate' => "{$count} user(s) activated successfully.",
            'deactivate' => "{$count} user(s) deactivated successfully.",
            'delete' => "{$count} user(s) deleted successfully.",
            'role' => "{$count} user(s) role updated successfully.",
            'site' => "{$count} user(s) site updated successfully.",
        };

        return redirect()->route('users.index')->with('success', $message);
    }
}
