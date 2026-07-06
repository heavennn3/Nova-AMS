<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable, SoftDeletes;

    protected $fillable = ['site_id', 'status'];

    // ─── Relationships ─────────────────────────────────────────────

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class);
    }

    // ─── EAV Helpers ───────────────────────────────────────────────

    public function fieldValues()
    {
        return $this->hasMany(AssetFieldValue::class);
    }

    /** Get a single dynamic field value. */
    public function getField(string $key): ?string
    {
        $fv = $this->fieldValues->firstWhere('column_key', $key);
        return $fv?->value;
    }

    /** Get all dynamic fields as key → value array. */
    public function getFields(): array
    {
        return $this->fieldValues->pluck('value', 'column_key')->toArray();
    }

    /** Set a single dynamic field (saves immediately). */
    public function setField(string $key, ?string $value): void
    {
        $this->fieldValues()->updateOrCreate(
            ['column_key' => $key],
            ['value' => $value]
        );
        $this->load('fieldValues');
    }

    /** Bulk sync dynamic fields from a key→value array. */
    public function syncFields(array $data): void
    {
        $keys = array_keys($data);
        // Delete removed keys
        $this->fieldValues()->whereNotIn('column_key', $keys)->delete();
        // Upsert each
        foreach ($data as $key => $value) {
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