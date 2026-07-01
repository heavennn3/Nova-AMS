<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Site;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TechnicianManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $isSiteManager = $user->hasRole('Site Manager');

        // Get accessible sites based on user role
        if ($isAdmin) {
            $accessibleSiteIds = Site::pluck('id')->toArray();
        } elseif ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }
        } else {
            // Non-admin/non-manager users cannot access this page
            abort(403, 'You do not have permission to manage technicians.');
        }

        // Get technicians with their site assignments
        $techniciansQuery = User::whereHas('roles', function($query) {
            $query->where('name', 'Technician');
        })
        ->with(['sites', 'pagePermissions'])
        ->withCount(['workOrders as active_work_orders' => function($query) {
            $query->whereIn('status', ['open', 'in_progress']);
        }]);

        // Apply site filtering for non-admin users
        if (!$isAdmin) {
            $techniciansQuery->whereHas('sites', function($query) use ($accessibleSiteIds) {
                $query->whereIn('sites.id', $accessibleSiteIds);
            });
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $techniciansQuery->where(function($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('phone', 'like', '%' . $search . '%')
                      ->orWhere('ic_number', 'like', '%' . $search . '%');
            });
        }

        // Apply site filter
        if ($request->has('site_id') && !empty($request->site_id)) {
            $techniciansQuery->whereHas('sites', function($query) use ($request) {
                $query->where('sites.id', $request->site_id);
            });
        }

        // Apply status filter
        if ($request->has('status') && !empty($request->status)) {
            if ($request->status === 'active') {
                $techniciansQuery->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $techniciansQuery->where('is_active', false);
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $techniciansQuery->orderBy($sortBy, $sortOrder);

        // Paginate results
        $technicians = $techniciansQuery->paginate($request->get('per_page', 10));

        // Get all accessible sites for filtering
        $sites = Site::whereIn('id', $accessibleSiteIds)->get();

        // Transform technicians data for frontend
        $technicians->getCollection()->transform(function ($technician) {
            return [
                'id' => $technician->id,
                'name' => $technician->name,
                'email' => $technician->email,
                'phone' => $technician->phone,
                'ic_number' => $technician->ic_number,
                'profile_photo' => $technician->profile_photo,
                'is_active' => $technician->is_active,
                'sites' => $technician->sites->map(function($site) {
                    return [
                        'id' => $site->id,
                        'name' => $site->name,
                        'code' => $site->code,
                    ];
                }),
                'site_names' => $technician->sites->pluck('name')->join(', '),
                'active_work_orders' => $technician->active_work_orders,
                'created_at' => $technician->created_at->format('Y-m-d'),
                'last_active' => $technician->updated_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('technicians/manage', [
            'technicians' => $technicians,
            'sites' => $sites,
            'filters' => [
                'search' => $request->get('search', ''),
                'site_id' => $request->get('site_id', ''),
                'status' => $request->get('status', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $request->get('per_page', 10),
            ],
            'can' => [
                'create' => $isAdmin || $isSiteManager,
                'edit' => $isAdmin || $isSiteManager,
                'delete' => $isAdmin,
                'toggle_active' => $isAdmin || $isSiteManager,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $isSiteManager = $user->hasRole('Site Manager');

        if (!$isAdmin && !$isSiteManager) {
            abort(403, 'You do not have permission to create technicians.');
        }

        // Get accessible sites
        if ($isAdmin) {
            $accessibleSiteIds = Site::pluck('id')->toArray();
        } elseif ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'ic_number' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'site_ids' => 'required|array|min:1',
            'site_ids.*' => 'required|integer|exists:sites,id',
            'is_active' => 'boolean',
        ]);

        // Ensure site_ids are within accessible sites
        $validSiteIds = array_intersect($validated['site_ids'], $accessibleSiteIds);
        if (empty($validSiteIds)) {
            return back()->with('error', 'Invalid site selection. You can only assign technicians to sites you have access to.');
        }

        DB::beginTransaction();
        try {
            $technician = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'ic_number' => $validated['ic_number'] ?? null,
                'password' => Hash::make($validated['password']),
                'is_active' => $validated['is_active'] ?? true,
                'email_verified_at' => now(),
            ]);

            // Assign Technician role
            $technician->assignRole('Technician');

            // Assign to sites
            $technician->sites()->sync($validSiteIds);

            DB::commit();
            return back()->with('success', 'Technician created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create technician: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $isSiteManager = $user->hasRole('Site Manager');

        if (!$isAdmin && !$isSiteManager) {
            abort(403, 'You do not have permission to update technicians.');
        }

        $technician = User::findOrFail($id);

        // Verify technician has Technician role
        if (!$technician->hasRole('Technician')) {
            return back()->with('error', 'User is not a technician.');
        }

        // Check site access for site managers
        if ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }

            $technicianSiteIds = $technician->sites()->pluck('sites.id')->toArray();
            if (!array_intersect($technicianSiteIds, $accessibleSiteIds)) {
                abort(403, 'You do not have permission to update this technician.');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($id)],
            'phone' => 'nullable|string|max:20',
            'ic_number' => 'nullable|string|max:20',
            'site_ids' => 'required|array|min:1',
            'site_ids.*' => 'required|integer|exists:sites,id',
            'is_active' => 'boolean',
        ]);

        // Get accessible sites
        if ($isAdmin) {
            $accessibleSiteIds = Site::pluck('id')->toArray();
        } elseif ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }
        }

        // Ensure site_ids are within accessible sites
        $validSiteIds = array_intersect($validated['site_ids'], $accessibleSiteIds);
        if (empty($validSiteIds)) {
            return back()->with('error', 'Invalid site selection. You can only assign technicians to sites you have access to.');
        }

        DB::beginTransaction();
        try {
            $technician->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'ic_number' => $validated['ic_number'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Update site assignments
            $technician->sites()->sync($validSiteIds);

            DB::commit();
            return back()->with('success', 'Technician updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update technician: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $user = auth()->user();
        if (!$user->hasRole('Admin')) {
            abort(403, 'Only admins can delete technicians.');
        }

        $technician = User::findOrFail($id);

        // Verify technician has Technician role
        if (!$technician->hasRole('Technician')) {
            return back()->with('error', 'User is not a technician.');
        }

        try {
            $technician->delete();
            return back()->with('success', 'Technician deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete technician: ' . $e->getMessage());
        }
    }

    public function toggleActive(Request $request, $id)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $isSiteManager = $user->hasRole('Site Manager');

        if (!$isAdmin && !$isSiteManager) {
            abort(403, 'You do not have permission to change technician status.');
        }

        $technician = User::findOrFail($id);

        // Verify technician has Technician role
        if (!$technician->hasRole('Technician')) {
            return back()->with('error', 'User is not a technician.');
        }

        // Check site access for site managers
        if ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }

            $technicianSiteIds = $technician->sites()->pluck('sites.id')->toArray();
            if (!array_intersect($technicianSiteIds, $accessibleSiteIds)) {
                abort(403, 'You do not have permission to modify this technician.');
            }
        }

        try {
            $technician->update(['is_active' => !$technician->is_active]);
            $status = $technician->is_active ? 'activated' : 'deactivated';
            return back()->with('success', "Technician {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to change technician status: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $user = auth()->user();
        $isAdmin = $user->hasRole('Admin');
        $isSiteManager = $user->hasRole('Site Manager');

        if (!$isAdmin && !$isSiteManager) {
            abort(403, 'You do not have permission to export technicians.');
        }

        // Get accessible sites
        if ($isAdmin) {
            $accessibleSiteIds = Site::pluck('id')->toArray();
        } elseif ($isSiteManager) {
            $accessibleSiteIds = $user->sites()->pluck('sites.id')->toArray();
            if (empty($accessibleSiteIds) && $user->site_id) {
                $accessibleSiteIds = [$user->site_id];
            }
        } else {
            abort(403, 'You do not have permission to export technicians.');
        }

        // Get technicians with same filtering logic as index
        $techniciansQuery = User::whereHas('roles', function($query) {
            $query->where('name', 'Technician');
        })->with(['sites']);

        // Apply site filtering for non-admin users
        if (!$isAdmin) {
            $techniciansQuery->whereHas('sites', function($query) use ($accessibleSiteIds) {
                $query->whereIn('sites.id', $accessibleSiteIds);
            });
        }

        $technicians = $techniciansQuery->get();

        $csvData = [];
        $csvData[] = ['ID', 'Name', 'Email', 'Phone', 'IC Number', 'Sites', 'Active', 'Created At'];

        foreach ($technicians as $technician) {
            $csvData[] = [
                $technician->id,
                $technician->name,
                $technician->email,
                $technician->phone ?? 'N/A',
                $technician->ic_number ?? 'N/A',
                $technician->sites->pluck('name')->join(', '),
                $technician->is_active ? 'Yes' : 'No',
                $technician->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'technicians_' . date('Y_m_d_H_i_s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}