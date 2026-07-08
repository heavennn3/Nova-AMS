<?php

namespace App\Http\Controllers;

use App\Models\SparePart;
use App\Models\SparePartCategory;
use App\Models\Checkout;
use App\Models\Site;
use App\Models\TableConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SparePartController extends Controller
{
    public function dashboard()
    {
        $totalParts = SparePart::count();
        $availableParts = SparePart::where('status', 'available')->count();
        $faultyParts = SparePart::where('status', 'faulty')->count();

        // Category breakdown
        $categoryData = SparePart::selectRaw('category, count(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'count' => $item->count,
                    'value' => '0.00',
                ];
            });

        // All spare parts for table display
        $allParts = SparePart::with(['site', 'creator', 'user'])
            ->latest()
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'category' => $part->category,
                    'location' => $part->location,
                    'site_name' => $part->site?->name ?? 'N/A',
                    'status' => $part->status,
                    'used_by' => $part->used_by,
                    'used_by_name' => $part->user?->name ?? '—',
                    'created_by_name' => $part->creator?->name ?? 'N/A',
                ];
            });

        $recentlyAdded = SparePart::where('created_at', '>=', now()->subDays(7))->count();

        $sites = \App\Models\Site::orderBy('name')->get();

        return Inertia::render('SpareParts/Dashboard', [
            'totalParts' => $totalParts,
            'availableParts' => $availableParts,
            'outOfStockParts' => $faultyParts,
            'recentlyAdded' => $recentlyAdded,
            'categoryData' => $categoryData,
            'lowStockAlerts' => collect(),
            'allParts' => $allParts,
            'sites' => $sites,
        ]);
    }

    public function index()
    {
        $spareParts = SparePart::with(['site', 'creator'])
            ->latest()
            ->get()
            ->map(function ($part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'part_number' => $part->part_number,
                    'category' => $part->category,
                    'location' => $part->location,
                    'site_id' => $part->site_id,
                    'site_name' => $part->site?->name ?? 'N/A',
                    'status' => $part->status,
                    'used_by' => $part->used_by,
                    'used_by_name' => $part->user?->name ?? '—',
                    'created_by_name' => $part->creator?->name ?? 'N/A',
                ];
            });

        $sites = \App\Models\Site::orderBy('name')->get();
        $users = \App\Models\User::orderBy('name')->get();

        return Inertia::render('SpareParts/Index', [
            'spareParts' => $spareParts,
            'sites' => $sites,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|unique:spare_parts,part_number',
            'category' => 'required|string|in:RAM,MONITOR,STORAGE,CABLE,PSU,RJ45,CABLE TRACER',
            'site_id' => 'nullable|exists:sites,id',
            'location' => 'required|string|max:255',
        ]);

        $validated['status'] = 'available';
        $validated['created_by'] = auth()->id();

        $sparePart = SparePart::create($validated);

        return redirect()->back()->with('success', 'Spare part added successfully.');
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'part_number' => 'required|string|unique:spare_parts,part_number,' . $sparePart->id,
            'category' => 'required|string|in:RAM,MONITOR,STORAGE,CABLE,PSU,RJ45,CABLE TRACER',
            'site_id' => 'nullable|exists:sites,id',
            'location' => 'required|string|max:255',
            'status' => 'required|string|in:available,in_used,faulty',
            'used_by' => 'nullable|exists:users,id',
        ]);

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
            'quantity' => 'required|integer|min:1|max:' . $sparePart->quantity,
            'purpose' => 'nullable|string',
            'expected_return_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Update stock level
        $sparePart->decrement('quantity', $validated['quantity']);

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
        $checkout->sparePart->increment('quantity', $checkout->quantity);

        // Update checkout record
        $checkout->update([
            'actual_return_date' => now(),
            'status' => 'returned',
        ]);

        return redirect()->back()->with('success', 'Spare part returned successfully.');
    }

    public function exportCsv()
    {
        $configs = TableConfiguration::getAllColumns('spare_parts');
        $columnKeys = $configs->pluck('column_key')->toArray();
        $headers = $configs->pluck('column_title', 'column_key')->toArray();

        $spareParts = SparePart::with('fieldValues')->get();
        $filename = "spare_parts_" . date('Y-m-d') . ".csv";
        $responseHeaders = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=\"$filename\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function() use ($spareParts, $columnKeys, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, array_values($headers));

            foreach ($spareParts as $part) {
                $fields = $part->getFields();
                $row = [];
                foreach ($columnKeys as $ck) {
                    $row[] = $fields[$ck] ?? $part->{$ck} ?? '';
                }
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $responseHeaders);
    }

    public function importBulk(Request $request)
    {
        $request->validate([
            'spare_parts' => 'required|array',
        ]);

        $rows = $request->spare_parts;
        if (empty($rows)) {
            return redirect()->back()->with('error', 'No data to import.');
        }

        $firstRow = $rows[0];
        $headers = array_keys($firstRow);

        // ── Auto-create TableConfiguration if empty ──
        $existingConfigs = TableConfiguration::forTable('spare_parts')->count();
        if ($existingConfigs === 0) {
            $this->createConfigsFromHeaders($headers);
        }

        $fillable = (new SparePart)->getFillable();
        $configs = TableConfiguration::getAllColumns('spare_parts');
        $columnKeys = $configs->pluck('column_key')->toArray();
        $importedCount = 0;

        foreach ($rows as $row) {
            $normalized = [];
            foreach ($row as $k => $v) {
                $normalized[strtolower(trim(preg_replace('/\s+/', '_', $k)))] = $v;
            }

            if (empty($normalized)) continue;

            // Map normalized headers to fillable model fields
            $data = [];
            foreach ($normalized as $nk => $v) {
                $field = $this->mapHeaderToField($nk);
                if ($field && in_array($field, $fillable)) {
                    $data[$field] = $v;
                }
            }

            if (empty($data)) continue;

            $data['status'] ??= 'available';
            $data['quantity'] = (int)($data['quantity'] ?? 0);
            $data['minimum_stock_level'] = (int)($data['minimum_stock_level'] ?? 0);

            // Auto-register category in master data
            if (!empty($data['category'])) {
                $this->ensureCategory($data['category'], $normalized);
            }

            $part = SparePart::create($data);

            // Store remaining CSV columns as EAV field values
            $eavData = [];
            foreach ($columnKeys as $ck) {
                $mappedField = $this->mapHeaderToField($ck);
                if ($mappedField && in_array($mappedField, $fillable)) continue;
                // Also skip if it was already mapped and used in $data
                if (array_key_exists($ck, $normalized)) {
                    $eavData[$ck] = $normalized[$ck];
                }
            }
            if (!empty($eavData)) {
                $part->syncFields($eavData);
            }

            $importedCount++;
        }

        return redirect()->back()->with('success', "Successfully imported $importedCount spare parts!");
    }

    private function mapHeaderToField(string $normalizedKey): ?string
    {
        $map = [
            'name' => 'name',
            'part_name' => 'name',
            'item_name' => 'name',
            'part_id' => 'part_number',
            'part_number' => 'part_number',
            'quantity' => 'quantity',
            'stock_level' => 'quantity',
            'stock' => 'quantity',
            'minimum_stock' => 'minimum_stock_level',
            'minimum_stock_level' => 'minimum_stock_level',
            'min_stock' => 'minimum_stock_level',
            'storage_location' => 'location',
            'location' => 'location',
            'category' => 'category',
            'status' => 'status',
        ];
        return $map[$normalizedKey] ?? null;
    }

    private function createConfigsFromHeaders(array $headers): void
    {
        $sortOrder = 0;
        foreach ($headers as $header) {
            $columnKey = strtolower(trim(preg_replace('/\s+/', '_', $header)));
            // Skip headers that directly map to hardcoded columns (stock_level already hardcoded)
            $sortOrder++;
            TableConfiguration::create([
                'table_name' => 'spare_parts',
                'column_key' => $columnKey,
                'column_title' => $header,
                'data_type' => $this->inferDataType($columnKey),
                'is_primary_key' => $sortOrder === 1,
                'is_sortable' => true,
                'is_visible' => true,
                'sort_order' => $sortOrder * 10,
            ]);
        }
    }

    private function inferDataType(string $columnKey): string
    {
        $numberHints = ['quantity', 'stock', 'count', 'total', 'amount', 'price', 'cost', 'unit_cost', 'minimum_stock'];
        foreach ($numberHints as $hint) {
            if (str_contains($columnKey, $hint)) return 'number';
        }
        return 'text';
    }

    private function ensureCategory(string $categoryName, array $normalized): void
    {
        $subCategoryName = $normalized['subcategory'] ?? $normalized['sub_category'] ?? null;

        if ($subCategoryName) {
            // Category is parent, subcategory is child
            $parentCat = SparePartCategory::firstOrCreate(['name' => $categoryName]);
            SparePartCategory::firstOrCreate(
                ['name' => $subCategoryName],
                ['parent_id' => $parentCat->id]
            );
        } else {
            // Standalone top-level category
            SparePartCategory::firstOrCreate(['name' => $categoryName]);
        }
    }
}
