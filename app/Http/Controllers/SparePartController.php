<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use App\Models\Checkout;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SparePartController extends Controller
{
    public function dashboard()
    {
        $totalParts = SparePart::count();
        $totalValue = SparePart::get()->sum(function ($part) {
            return $part->stock_level * $part->unit_cost;
        });
        $availableParts = SparePart::where('status', 'available')->count();
        $lowStockParts = SparePart::whereRaw('stock_level <= minimum_stock_level')->count();
        $outOfStockParts = SparePart::where('stock_level', 0)->count();

        // Category breakdown
        $categoryData = SparePart::selectRaw('category, COUNT(*) as count, SUM(stock_level * unit_cost) as value')
            ->groupBy('category')
            ->get()
            ->map(function ($cat) {
                return [
                    'category' => $cat->category,
                    'count' => $cat->count,
                    'value' => number_format($cat->value, 2)
                ];
            });

        // Recent checkouts
        $recentCheckouts = Checkout::with(['sparePart', 'user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($checkout) {
                return [
                    'id' => $checkout->id,
                    'part_name' => $checkout->sparePart?->name ?? 'Unknown',
                    'user_name' => $checkout->user?->name ?? 'Unknown',
                    'quantity' => $checkout->quantity,
                    'checkout_date' => $checkout->checkout_date?->format('Y-m-d'),
                    'status' => $checkout->status,
                ];
            });

        // Low stock alerts
        $lowStockAlerts = SparePart::whereRaw('stock_level <= minimum_stock_level')
            ->where('stock_level', '>', 0)
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($part) {
                return [
                    'name' => $part->name,
                    'stock_level' => $part->stock_level,
                    'minimum_level' => $part->minimum_stock_level,
                    'location' => $part->location,
                ];
            });

        return Inertia::render('SpareParts/Dashboard', [
            'totalParts' => $totalParts,
            'totalValue' => number_format($totalValue, 2),
            'availableParts' => $availableParts,
            'lowStockParts' => $lowStockParts,
            'outOfStockParts' => $outOfStockParts,
            'categoryData' => $categoryData,
            'recentCheckouts' => $recentCheckouts,
            'lowStockAlerts' => $lowStockAlerts,
        ]);
    }

    public function index()
    {
        $spareParts = SparePart::with(['site'])
            ->latest()
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'category' => $part->category,
                    'stock_level' => $part->stock_level,
                    'minimum_stock_level' => $part->minimum_stock_level,
                    'unit_cost' => number_format($part->unit_cost, 2),
                    'location' => $part->location,
                    'site' => $part->site?->name ?? 'N/A',
                    'status' => $part->status,
                    'availability' => $part->availability,
                    'total_value' => number_format($part->total_value, 2),
                ];
            });

        $categories = SparePart::select('category')
            ->distinct()
            ->whereNotNull('category')
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('SpareParts/Index', [
            'spareParts' => $spareParts,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'part_number' => 'required|string|unique:spare_parts,part_number',
            'category' => 'required|string',
            'stock_level' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'location' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
            'specifications' => 'nullable|array',
            'compatibility' => 'nullable|array',
        ]);

        $validated['specifications'] = $validated['specifications'] ?? [];
        $validated['compatibility'] = $validated['compatibility'] ?? [];

        SparePart::create($validated);

        return redirect()->back()->with('success', 'Spare part added successfully.');
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'part_number' => 'required|string|unique:spare_parts,part_number,' . $sparePart->id,
            'category' => 'required|string',
            'stock_level' => 'required|integer|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'location' => 'nullable|string',
            'site_id' => 'nullable|exists:sites,id',
            'status' => 'required|string',
            'specifications' => 'nullable|array',
            'compatibility' => 'nullable|array',
        ]);

        $validated['specifications'] = $validated['specifications'] ?? [];
        $validated['compatibility'] = $validated['compatibility'] ?? [];

        $sparePart->update($validated);

        return redirect()->back()->with('success', 'Spare part updated successfully.');
    }

    public function destroy(SparePart $sparePart)
    {
        $sparePart->delete();
        return redirect()->back()->with('success', 'Spare part deleted successfully.');
    }

    public function checkout(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1|max:' . $sparePart->stock_level,
            'purpose' => 'nullable|string',
            'expected_return_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Update stock level
        $sparePart->decrement('stock_level', $validated['quantity']);

        // Create checkout record
        Checkout::create([
            'spare_part_id' => $sparePart->id,
            'user_id' => $validated['user_id'],
            'quantity' => $validated['quantity'],
            'purpose' => $validated['purpose'] ?? '',
            'checkout_date' => now(),
            'expected_return_date' => $validated['expected_return_date'] ?? null,
            'status' => 'checked_out',
            'notes' => $validated['notes'] ?? '',
        ]);

        return redirect()->back()->with('success', 'Spare part checked out successfully.');
    }

    public function returnCheckout(Request $request, Checkout $checkout)
    {
        // Update stock level
        $checkout->sparePart->increment('stock_level', $checkout->quantity);

        // Update checkout record
        $checkout->update([
            'actual_return_date' => now(),
            'status' => 'returned',
        ]);

        return redirect()->back()->with('success', 'Spare part returned successfully.');
    }

    public function exportCsv()
    {
        $spareParts = SparePart::with('site')->get();
        $filename = "spare_parts_" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=\"$filename\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function() use ($spareParts) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Part Number', 'Category', 'Stock Level', 'Min Level', 'Unit Cost', 'Location', 'Site', 'Status']);

            foreach ($spareParts as $part) {
                fputcsv($file, [
                    $part->name,
                    $part->part_number,
                    $part->category,
                    $part->stock_level,
                    $part->minimum_stock_level,
                    $part->unit_cost,
                    $part->location,
                    $part->site?->name ?? '',
                    $part->status,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
