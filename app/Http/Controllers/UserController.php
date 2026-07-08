<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get()
            ->filter(fn($user) => !$user->hasRole('Admin'))
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->roles->pluck('name')->first() ?? 'None',
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
            'roles' => ['Employee', 'Manager'],
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => ['Employee', 'Manager'],
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:Employee,Manager',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'site_id' => $validated['site_id'] ?? null,
        ];

        $user = User::create($userData);

        if (!empty($validated['role'])) {
            $user->assignRole($validated['role']);
        }

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first() ?? '',
                'site_id' => $user->site_id,
            ],
            'roles' => ['Employee', 'Manager'],
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|in:Employee,Manager',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->site_id = $validated['site_id'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        if (!empty($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
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
}
