<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\AssetModel;
use App\Models\AssetType;
use App\Models\CustomField;
use App\Models\Department;
use App\Models\License;
use App\Models\Location;
use App\Models\Manufacturer;
use App\Models\Site;
use App\Models\StatusLabel;
use App\Models\SparePart;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Vendor;
use App\Models\WorkOrder;
use OwenIt\Auditing\Models\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuickApiController extends Controller
{
    public function storeVendor(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:vendors,name']);
        return response()->json(Vendor::create($validated));
    }

    public function storeType(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:asset_types,name']);
        return response()->json(AssetType::create($validated));
    }

    public function storeSite(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:sites,name']);
        $site = Site::create(['name' => $validated['name'], 'code' => strtoupper(substr(trim($validated['name']), 0, 3)) . '-' . rand(1000, 9999)]);
        return response()->json($site);
    }

    public function storeLocation(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:locations,name']);
        return response()->json(Location::create($validated));
    }

    public function storeSupplier(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:suppliers,name']);
        return response()->json(Supplier::create($validated));
    }

    public function storeStatusLabel(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|unique:status_labels,name', 'type' => 'nullable|string']);
        return response()->json(StatusLabel::create(['name' => $validated['name'], 'type' => $validated['type'] ?? 'deployable']));
    }

    public function bulkImport(Request $request)
    {
        $type = $request->input('type');
        $rows = $request->input('rows', []);
        if (empty($rows)) return response()->json(['message' => 'No rows'], 400);

        $count = 0;
        $val = function ($keys, $default = null) use ($rows) {
            foreach ($rows[0] ?? [] as $k => $v) {
                $nk = strtolower(str_replace(['_', ' ', '-'], '', trim($k)));
                foreach ((array)$keys as $sk) {
                    if ($nk === strtolower(str_replace(['_', ' ', '-'], '', trim($sk)))) return $v;
                }
            }
            return $default;
        };

        foreach ($rows as $row) {
            $get = function ($keys, $default = null) use ($row) {
                foreach ($row as $k => $v) {
                    $nk = strtolower(str_replace(['_', ' ', '-'], '', trim($k)));
                    foreach ((array)$keys as $sk) {
                        if ($nk === strtolower(str_replace(['_', ' ', '-'], trim($sk)))) return $v;
                    }
                }
                return $default;
            };

            switch ($type) {
                case 'categories':
                    if ($name = $get(['name', 'category'])) { AssetCategory::firstOrCreate(['name' => trim($name)]); $count++; }
                    break;
                case 'departments':
                    if ($name = $get(['name', 'department'])) { Department::firstOrCreate(['name' => trim($name)]); $count++; }
                    break;
                case 'suppliers':
                    if ($name = $get(['name', 'supplier'])) { Supplier::firstOrCreate(['name' => trim($name)]); $count++; }
                    break;
                case 'locations':
                    if ($name = $get(['name', 'location'])) { Location::firstOrCreate(['name' => trim($name)]); $count++; }
                    break;
                case 'manufacturers':
                    if ($name = $get(['name', 'manufacturer'])) { Manufacturer::firstOrCreate(['name' => trim($name)]); $count++; }
                    break;
                case 'users':
                    $email = $get(['email']);
                    $name = $get(['name', 'username']);
                    if ($email && $name) { User::firstOrCreate(['email' => trim($email)], ['name' => trim($name), 'password' => bcrypt('password123')]); $count++; }
                    break;
                case 'asset-models':
                    if ($name = $get(['name', 'model'])) {
                        $mfgName = $get(['manufacturer', 'brand']);
                        $mfgId = $mfgName ? (Manufacturer::firstOrCreate(['name' => trim($mfgName)])->id) : null;
                        AssetModel::firstOrCreate(['name' => trim($name)], ['manufacturer_id' => $mfgId]);
                        $count++;
                    }
                    break;
            }
        }
        return response()->json(['message' => "Imported $count records", 'count' => $count]);
    }

    public function bulkDelete(Request $request)
    {
        $type = $request->input('type');
        $ids = $request->input('ids', []);
        if (empty($ids)) return response()->json(['message' => 'No records selected'], 400);

        $map = [
            'assets' => Asset::class, 'categories' => AssetCategory::class, 'departments' => Department::class,
            'suppliers' => Supplier::class, 'locations' => Location::class, 'manufacturers' => Manufacturer::class,
            'status-labels' => StatusLabel::class, 'users' => User::class, 'custom-fields' => CustomField::class,
            'spare-parts' => SparePart::class, 'licenses' => License::class,
            'logs' => Audit::class, 'audit-logs' => Audit::class,
        ];

        $class = $map[$type] ?? null;
        if (!$class) return response()->json(['message' => "Unknown type: $type"], 400);

        $count = $class::whereIn('id', $ids)->delete();
        return response()->json(['message' => "Deleted $count records", 'count' => $count]);
    }

    public function bulkStatus(Request $request)
    {
        $type = $request->input('type');
        $ids = $request->input('ids', []);
        $status = $request->input('status');
        if (empty($ids)) return response()->json(['message' => 'No records'], 400);

        $count = 0;
        switch ($type) {
            case 'assets':
                $count = Asset::whereIn('id', $ids)->update(['status' => $status]);
                break;
            case 'users':
                $count = User::whereIn('id', $ids)->update(['is_active' => $status === 'active']);
                break;
            case 'spare-parts':
                $count = SparePart::whereIn('id', $ids)->update(['status' => $status]);
                break;
            case 'licenses':
                $count = License::whereIn('id', $ids)->update(['status' => $status]);
                break;
            default:
                return response()->json(['message' => "Unsupported type: $type"], 400);
        }
        return response()->json(['message' => "Updated $count records", 'count' => $count]);
    }
}
