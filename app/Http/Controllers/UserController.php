<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['roles', 'sites'])->get()
            ->filter(fn($user) => !$user->hasRole('Admin'))
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'ic_number' => $user->ic_number,
                    'profile_photo' => $user->profile_photo ? Storage::url($user->profile_photo) : null,
                    'role' => $user->roles->pluck('name')->first() ?? 'None',
                    'sites' => $user->sites->pluck('name')->toArray(),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            })->values();

        $sites = \DB::table('sites')->select('id', 'name')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'sites' => $sites,
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::where('name', '!=', 'Admin')->pluck('name'),
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'ic_number' => 'nullable|string|max:50',
            'profile_photo' => 'nullable|image|max:2048',
            'role' => 'nullable|string|exists:roles,name',
            'site_ids' => 'nullable|array',
            'site_ids.*' => 'exists:sites,id',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'ic_number' => $validated['ic_number'] ?? null,
        ];

        if ($request->hasFile('profile_photo')) {
            $userData['profile_photo'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user = User::create($userData);

        if (!empty($validated['site_ids'])) {
            $user->sites()->sync($validated['site_ids']);
        }

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
                'phone' => $user->phone,
                'ic_number' => $user->ic_number,
                'profile_photo' => $user->profile_photo ? Storage::url($user->profile_photo) : null,
                'role' => $user->roles->pluck('name')->first() ?? '',
                'site_ids' => $user->sites->pluck('id')->toArray(),
            ],
            'roles' => Role::where('name', '!=', 'Admin')->pluck('name'),
            'sites' => \DB::table('sites')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'ic_number' => 'nullable|string|max:50',
            'profile_photo' => 'nullable|image|max:2048',
            'role' => 'nullable|string|exists:roles,name',
            'site_ids' => 'nullable|array',
            'site_ids.*' => 'exists:sites,id',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->ic_number = $validated['ic_number'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            $user->profile_photo = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->save();

        if (isset($validated['site_ids'])) {
            $user->sites()->sync($validated['site_ids']);
        }

        if (!empty($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        } else {
            $user->syncRoles([]);
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
}
