<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class OperationsController extends Controller
{
    // Main Dashboard
    public function dashboard()
    {
        $stats = [
            'totalWorkOrders' => \App\Models\WorkOrder::count(),
            'pendingWorkOrders' => \App\Models\WorkOrder::where('status', 'open')->count(),
            'inProgressWorkOrders' => \App\Models\WorkOrder::where('status', 'in_progress')->count(),
            'completedWorkOrders' => \App\Models\WorkOrder::where('status', 'completed')->count(),
        ];

        return Inertia::render('operations-maintanance', [
            'stats' => $stats,
            'recentWorkOrders' => \App\Models\WorkOrder::with(['asset', 'technician'])->latest()->limit(10)->get()
        ]);
    }

    // Maintenance
    public function scheduling() { return Inertia::render('Maintenance/Scheduling'); }
    
    public function workOrders() 
    { 
        return Inertia::render('Maintenance/WorkOrders', [
            'workOrders' => \App\Models\WorkOrder::with(['asset', 'technician', 'reporter'])->latest()->get(),
            'assets' => \App\Models\Asset::all(),
            'technicians' => \App\Models\User::all() 
        ]); 
    }

    public function storeWorkOrder(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'issue' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        \App\Models\WorkOrder::create([
            ...$validated,
            'reported_by' => auth()->id(),
            'reported_at' => now(),
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Work Order created successfully.');
    }

    public function updateWorkOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,completed,closed',
        ]);

        $wo = \App\Models\WorkOrder::findOrFail($id);
        $wo->update(['status' => $request->status]);

        if ($request->status === 'completed' || $request->status === 'closed') {
            $wo->update(['completed_at' => now()]);
            
            // Integration: If work order is completed, set asset back to available
            if ($wo->asset) {
                $wo->asset->update(['status' => 'available']);
            }
        }

        if ($request->status === 'in_progress') {
            // Integration: If work is in progress, set asset to maintenance
            if ($wo->asset) {
                $wo->asset->update(['status' => 'maintenance']);
            }
        }

        return redirect()->back()->with('success', 'Status updated and asset status synchronized.');
    }

    public function history() 
    { 
        return Inertia::render('Maintenance/History', [
            'history' => \App\Models\WorkOrder::whereIn('status', ['completed', 'closed'])->with(['asset', 'technician'])->latest()->get()
        ]); 
    }

    public function parts() 
    { 
        return Inertia::render('Maintenance/Parts', [
            'parts' => \App\Models\SparePart::with('site')->latest()->get(),
            'sites' => \App\Models\Site::all(),
        ]); 
    }

    public function storePart(Request $request)
    {
        $validated = $request->validate([
            'part_number' => 'required|string|unique:spare_parts,part_number',
            'name' => 'required|string',
            'stock_level' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        \App\Models\SparePart::create($validated);
        return redirect()->back()->with('success', 'Spare part added successfully.');
    }

    public function updatePart(Request $request, $id)
    {
        $part = \App\Models\SparePart::findOrFail($id);
        
        $validated = $request->validate([
            'part_number' => 'required|string|unique:spare_parts,part_number,' . $part->id,
            'name' => 'required|string',
            'stock_level' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'nullable|numeric|min:0',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $part->update($validated);
        return redirect()->back()->with('success', 'Spare part updated successfully.');
    }

    public function destroyPart($id)
    {
        $part = \App\Models\SparePart::findOrFail($id);
        $part->delete();
        return redirect()->back()->with('success', 'Spare part deleted successfully.');
    }
    public function technicians() { return Inertia::render('Maintenance/Technicians'); }

    // Vendors
    public function performance() { return Inertia::render('Vendors/Performance'); }
    public function alerts() { return Inertia::render('Vendors/Alerts'); }
    public function slas() { return Inertia::render('Vendors/Slas'); }
    public function po() { return Inertia::render('Vendors/PurchaseOrders'); }
    public function portal() { return Inertia::render('Vendors/Portal'); }
}
