<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vendors = Vendor::withCount('assets')->get()->map(function ($vendor) {
            return [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'contact_person' => $vendor->contact_person,
                'phone' => $vendor->phone,
                'email' => $vendor->email,
                'address' => $vendor->address,
                'logo' => $vendor->logo ? Storage::url($vendor->logo) : null,
                'assets_count' => $vendor->assets_count,
            ];
        });

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Vendors/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('vendor-logos', 'public');
        }

        Vendor::create($validated);

        return redirect()->route('vendors.index')->with('success', 'Vendor created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vendor $vendor)
    {
        $vendor->loadCount('assets');
        $vendor->load(['assets' => function ($q) {
            $q->withoutGlobalScopes()->select('id', 'asset_id', 'product_name', 'brand', 'status', 'vendor_id')->limit(10);
        }]);

        return Inertia::render('Vendors/Show', [
            'vendor' => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'contact_person' => $vendor->contact_person,
                'phone' => $vendor->phone,
                'email' => $vendor->email,
                'address' => $vendor->address,
                'logo' => $vendor->logo ? Storage::url($vendor->logo) : null,
                'assets_count' => $vendor->assets_count,
                'assets' => $vendor->assets,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vendor $vendor)
    {
        return Inertia::render('Vendors/Edit', [
            'vendor' => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'contact_person' => $vendor->contact_person,
                'phone' => $vendor->phone,
                'email' => $vendor->email,
                'address' => $vendor->address,
                'logo' => $vendor->logo ? Storage::url($vendor->logo) : null,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($vendor->logo) {
                Storage::disk('public')->delete($vendor->logo);
            }
            $validated['logo'] = $request->file('logo')->store('vendor-logos', 'public');
        }

        $vendor->update($validated);

        return redirect()->route('vendors.index')->with('success', 'Vendor updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return redirect()->route('vendors.index')->with('success', 'Vendor deleted successfully.');
    }
}
