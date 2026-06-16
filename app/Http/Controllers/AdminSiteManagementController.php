<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSiteManagementController extends Controller
{
    /**
     * Display a listing of all sites for admin management.
     */
    public function index()
    {
        $sites = Site::with(['users', 'siteAdmin'])->get()->map(function ($site) {
            return [
                'id' => $site->id,
                'name' => $site->name,
                'code' => $site->code,
                'region' => $site->region,
                'latitude' => $site->latitude,
                'longitude' => $site->longitude,
                'contact_email' => $site->contact_email,
                'contact_phone' => $site->contact_phone,
                'operational_hours' => $site->operational_hours,
                'address' => $site->address,
                'site_admin_id' => $site->site_admin_id,
                'site_admin' => $site->siteAdmin ? [
                    'id' => $site->siteAdmin->id,
                    'name' => $site->siteAdmin->name,
                    'email' => $site->siteAdmin->email,
                ] : null,
                'users_count' => $site->users->count(),
                'created_at' => $site->created_at->toIso8601String(),
                'updated_at' => $site->updated_at->toIso8601String(),
            ];
        })->toArray();

        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'site_id' => $user->site_id,
            ];
        })->toArray();

        return Inertia::render('Admin/Sites', [
            'sites' => $sites,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created site in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sites',
            'code' => 'nullable|string|max:255|unique:sites',
            'region' => 'nullable|string|max:255',
            'latitude' => 'nullable|decimal:8,6',
            'longitude' => 'nullable|decimal:9,6',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'operational_hours' => 'nullable|string',
            'address' => 'nullable|string',
            'site_admin_id' => 'nullable|exists:users,id',
        ]);

        Site::create($validated);

        return back()->with('success', 'Site created successfully.');
    }

    /**
     * Update the specified site in storage.
     */
    public function update(Request $request, $id)
    {
        $site = Site::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sites,name,' . $site->id,
            'code' => 'nullable|string|max:255|unique:sites,code,' . $site->id,
            'region' => 'nullable|string|max:255',
            'latitude' => 'nullable|decimal:8,6',
            'longitude' => 'nullable|decimal:9,6',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'operational_hours' => 'nullable|string',
            'address' => 'nullable|string',
            'site_admin_id' => 'nullable|exists:users,id',
        ]);

        $site->update($validated);

        return back()->with('success', 'Site updated successfully.');
    }

    /**
     * Remove the specified site from storage.
     */
    public function destroy($id)
    {
        $site = Site::findOrFail($id);

        // Check for dependencies
        $usersCount = $site->users()->count();
        $assetsCount = $site->assets()->count();

        if ($usersCount > 0 || $assetsCount > 0) {
            return back()->with('error', "Cannot delete site. It has {$usersCount} users and {$assetsCount} assets assigned.");
        }

        $site->delete();

        return back()->with('success', 'Site deleted successfully.');
    }

    /**
     * Get users assigned to a specific site.
     */
    public function getSiteUsers($id)
    {
        $site = Site::findOrFail($id);

        $users = $site->users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'is_active' => $user->is_active,
            ];
        })->toArray();

        return response()->json(['users' => $users]);
    }

    /**
     * Assign a site administrator to a site.
     */
    public function assignSiteAdmin(Request $request, $id)
    {
        $site = Site::findOrFail($id);

        $validated = $request->validate([
            'site_admin_id' => 'nullable|exists:users,id',
        ]);

        $site->update($validated);

        return back()->with('success', 'Site administrator assigned successfully.');
    }
}