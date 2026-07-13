<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = [
        'asset_id', 'site_id', 'region_id', 'status_id', 'added_by',
        'category_id', 'type_id', 'oem_id', 'location', 'quantity',
        'asset_name', 'purchase_year', 'serial_number', 'part_number',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'purchase_year' => 'integer',
            'status_id' => 'integer',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────────

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class);
    }

    public function type()
    {
        return $this->belongsTo(AssetType::class);
    }

    public function oem()
    {
        return $this->belongsTo(Oem::class);
    }

    public function status()
    {
        return $this->belongsTo(AssetStatus::class, 'status_id');
    }

    /** The currently active approved loan, if any. */
    public function activeLoan()
    {
        return $this->hasOne(AssetLoan::class)->where('status', 'approved')->latestOfMany();
    }

    /** Update the normalized asset status used by the loan workflow. */
    public function updateStatus(string $status): void
    {
        $statusId = AssetStatus::where('name', strtolower($status))->value('id');

        if ($statusId === null) {
            throw new \InvalidArgumentException("Unknown asset status [{$status}].");
        }

        $this->update(['status_id' => $statusId]);
    }

    // ─── EAV Helpers ───────────────────────────────────────────────

    public function fieldValues()
    {
        return $this->hasMany(AssetFieldValue::class);
    }

    /** Keys now stored as fixed columns. */
    protected array $fixedKeys = [
        'category_id', 'type_id', 'oem_id', 'location', 'quantity',
        'asset_name', 'purchase_year', 'serial_number', 'part_number',
    ];

    /** Get a single field: fixed columns first, fallback to EAV. */
    public function getField(string $key): ?string
    {
        if (in_array($key, $this->fixedKeys, true)) {
            $val = $this->getAttribute($key);
            return $val !== null ? (string) $val : null;
        }
        $fv = $this->fieldValues->firstWhere('column_key', $key);
        return $fv?->value;
    }

    /** Get all fields: merge fixed + EAV. */
    public function getFields(): array
    {
        $fixed = [];
        foreach ($this->fixedKeys as $key) {
            $val = $this->getAttribute($key);
            $fixed[$key] = $val !== null ? (string) $val : null;
        }
        return array_merge(
            $fixed,
            $this->fieldValues->pluck('value', 'column_key')->toArray()
        );
    }

    /** Set a single field: direct to model if fixed, else EAV. */
    public function setField(string $key, ?string $value): void
    {
        if (in_array($key, $this->fixedKeys, true)) {
            $this->update([$key => $value]);
            return;
        }
        $this->fieldValues()->updateOrCreate(
            ['column_key' => $key],
            ['value' => $value]
        );
        $this->load('fieldValues');
    }

    /** Bulk sync fields: fixed columns go to model, rest to EAV. */
    public function syncFields(array $data): void
    {
        $fixedData = [];
        $eavData = [];
        foreach ($data as $key => $value) {
            if (in_array($key, $this->fixedKeys, true)) {
                if ($key === 'quantity') {
                    $fixedData[$key] = $value !== null && $value !== '' ? (int) $value : 1;
                } elseif ($key === 'purchase_year') {
                    $fixedData[$key] = $value !== null && $value !== '' ? (int) $value : null;
                } else {
                    $fixedData[$key] = $value !== '' ? $value : null;
                }
            } else {
                $eavData[$key] = $value;
            }
        }

        if (!empty($fixedData)) {
            $this->update($fixedData);
        }

        // EAV: delete removed keys, upsert each
        $eavKeys = array_keys($eavData);
        $this->fieldValues()->whereNotIn('column_key', $eavKeys)->delete();
        foreach ($eavData as $key => $value) {
            $this->fieldValues()->updateOrCreate(
                ['column_key' => $key],
                ['value' => $value]
            );
        }
        $this->load('fieldValues');
    }

    /** The currently active (in-use) assignment, if any. */
    public function activeAssignment()
    {
        return $this->hasOne(AssetAssignment::class)->where('status', 'active')->latest();
    }

    /** All assignment history. */
    public function assignments()
    {
        return $this->hasMany(AssetAssignment::class)->latest();
    }
}
