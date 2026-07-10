<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetAssignment;
use Illuminate\Http\Request;

class AssetApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with('category', 'type', 'oem', 'site');
        if ($siteId = $request->query('site_id')) {
            $query->where('site_id', $siteId);
        }
        return response()->json($query->latest()->paginate($request->query('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|string|max:255',
            'asset_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:asset_categories,id',
            'type_id' => 'nullable|integer|exists:asset_types,id',
            'oem_id' => 'nullable|integer|exists:oems,id',
            'location' => 'nullable|string|max:255',
            'purchase_year' => 'nullable|integer|min:1900|max:2099',
            'serial_number' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'site_id' => 'nullable|integer|exists:sites,id',
        ]);
        return response()->json(Asset::create($validated), 201);
    }

    public function show(Asset $asset)
    {
        $asset->load('category', 'type', 'oem', 'site', 'activeAssignment.user', 'assignments');
        return response()->json($asset);
    }

    public function update(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'asset_id' => 'sometimes|required|string|max:255',
            'asset_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:asset_categories,id',
            'type_id' => 'nullable|integer|exists:asset_types,id',
            'oem_id' => 'nullable|integer|exists:oems,id',
            'location' => 'nullable|string|max:255',
            'purchase_year' => 'nullable|integer|min:1900|max:2099',
            'serial_number' => 'nullable|string|max:255',
            'part_number' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
        ]);
        $asset->update($validated);
        return response()->json($asset);
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function processScan(Request $request)
    {
        $validated = $request->validate([
            'scanned_data' => 'required|string',
            'scan_type' => 'required|in:asset_id,serial_number,barcode',
        ]);
        $sv = trim($validated['scanned_data']);
        $asset = Asset::where('serial_number', $sv)
            ->orWhere('asset_name', $sv)
            ->orWhere('asset_id', $sv)
            ->first();
        if ($asset) {
            return response()->json([
                'exists' => true,
                'deleted' => $asset->trashed(),
                'asset' => $asset->load('category', 'type', 'oem', 'site'),
                'message' => $asset->trashed() ? 'Asset exists but deleted' : 'Asset already registered',
            ]);
        }
        return response()->json([
            'exists' => false,
            'scanned_data' => ['asset_id' => $sv],
            'message' => 'Valid scan',
        ]);
    }

    public function processBulkScan(Request $request)
    {
        $validated = $request->validate(['scanned_items' => 'required|array']);
        $results = ['registered' => [], 'duplicates' => [], 'errors' => []];
        foreach ($validated['scanned_items'] as $item) {
            $id = $item['asset_id'] ?? $item ?? null;
            if (!$id) { $results['errors'][] = ['item' => $item, 'message' => 'Missing identifier']; continue; }
            $existing = Asset::where('asset_id', $id)->orWhere('serial_number', $id)->first();
            if ($existing) { $results['duplicates'][] = $existing; continue; }
            $a = Asset::create(['asset_id' => $id]);
            $results['registered'][] = $a;
        }
        return response()->json($results);
    }

    public function lookup($scannedValue)
    {
        $asset = Asset::where('asset_id', $scannedValue)
            ->orWhere('serial_number', $scannedValue)
            ->orWhere('asset_name', $scannedValue)
            ->with('category', 'type', 'oem', 'site')
            ->first();
        if (!$asset) {
            return response()->json(['found' => false, 'message' => 'Asset not found'], 404);
        }
        return response()->json(['found' => true, 'asset' => $asset]);
    }

    public function updateStatus(Request $request, Asset $asset)
    {
        $validated = $request->validate(['status' => 'required|string|max:255']);
        $asset->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Status updated']);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:assets,id', 'status' => 'required|string']);
        $count = Asset::whereIn('id', $validated['ids'])->update(['status' => $validated['status']]);
        return response()->json(['message' => "$count assets updated"]);
    }

    public function importBulk(Request $request)
    {
        $validated = $request->validate(['assets' => 'required|array', 'site_id' => 'nullable|integer|exists:sites,id']);
        $count = 0;
        foreach ($validated['assets'] as $row) {
            $mapped = [];
            foreach (['asset_id', 'asset_name', 'category_id', 'type_id', 'oem_id', 'location', 'purchase_year', 'serial_number', 'part_number', 'quantity', 'status'] as $key) {
                if (isset($row[$key])) $mapped[$key] = $row[$key];
            }
            if (empty($mapped['asset_id'])) continue;
            $existing = Asset::where('asset_id', $mapped['asset_id'])->first();
            if ($existing) { $existing->update($mapped); }
            else { $mapped['site_id'] = $validated['site_id'] ?? null; Asset::create($mapped); }
            $count++;
        }
        return response()->json(['message' => "Imported $count assets"]);
    }

    public function exportCsv()
    {
        $assets = Asset::with('category', 'type', 'oem')->latest()->get();
        $headers = ['Asset ID', 'Asset Name', 'Category', 'Type', 'Location', 'OEM', 'Purchase Year', 'Serial Number', 'Part Number', 'Quantity', 'Status'];
        $callback = function () use ($assets, $headers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            foreach ($assets as $a) {
                fputcsv($handle, [$a->asset_id, $a->asset_name, $a->category?->name, $a->type?->name, $a->location, $a->oem?->name, $a->purchase_year, $a->serial_number, $a->part_number, $a->quantity, $a->status]);
            }
            fclose($handle);
        };
        return response()->stream($callback, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename=assets.csv']);
    }

    public function checkout(Request $request, Asset $asset)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'remarks' => 'nullable|string',
        ]);
        $assignment = AssetAssignment::create([
            'asset_id' => $asset->id,
            'user_id' => $validated['user_id'],
            'location_id' => $validated['location_id'] ?? null,
            'site_id' => $asset->site_id,
            'assigned_at' => now(),
            'status' => 'active',
            'remarks' => $validated['remarks'] ?? null,
        ]);
        return response()->json($assignment, 201);
    }

    public function checkin(Request $request, Asset $asset)
    {
        $assignment = AssetAssignment::where('asset_id', $asset->id)->where('status', 'active')->latest()->first();
        if (!$assignment) {
            return response()->json(['message' => 'No active assignment'], 404);
        }
        $assignment->update(['status' => 'returned', 'returned_at' => now()]);
        return response()->json($assignment);
    }

    public function assignments(Asset $asset)
    {
        return response()->json($asset->assignments()->with('user', 'location')->get());
    }
}
