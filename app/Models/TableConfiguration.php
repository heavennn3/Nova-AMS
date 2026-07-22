<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TableConfiguration extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'table_name',
        'site_id',
        'column_key',
        'column_title',
        'data_type',
        'data_source',
        'is_primary_key',
        'is_sortable',
        'is_filterable',
        'is_visible',
        'sort_order',
        'width',
        'alignment',
        'format_pattern',
        'options',
        'created_by',
        'updated_by',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    protected $casts = [
        'is_primary_key' => 'boolean',
        'is_sortable' => 'boolean',
        'is_filterable' => 'boolean',
        'is_visible' => 'boolean',
        'options' => 'array',
    ];

    /**
     * Get the user who created the configuration.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the configuration.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope for a specific table.
     */
    public function scopeForTable($query, $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    public function scopeForSite($query, $siteId)
    {
        if ($siteId === null) {
            return $query->whereNull('site_id');
        }
        return $query->where('site_id', $siteId);
    }

    /**
     * Scope for visible columns only.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope ordered by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get visible columns for a specific table, optionally scoped to a site.
     */
    public static function getVisibleColumns($tableName, $siteId = null)
    {
        $q = self::forTable($tableName)->visible()->ordered();
        if ($siteId !== null) {
            $q->where('site_id', $siteId);
        }
        return $q->get();
    }

    /**
     * Get all columns (including hidden) for a specific table, optionally scoped to a site.
     * When no siteId given, returns ALL columns (backward compatible).
     * When siteId is given, returns only columns for that site.
     * Falls back to global configs if the site has no custom configs.
     */
    public static function getAllColumns($tableName, $siteId = null)
    {
        $q = self::forTable($tableName)->ordered();
        if ($siteId !== null) {
            $q->where('site_id', $siteId);
        }
        $results = $q->get();
        // If site has no configs, fall back to global configs
        if ($siteId !== null && $results->isEmpty()) {
            return self::forTable($tableName)->ordered()->whereNull('site_id')->get();
        }
        return $results;
    }
}
