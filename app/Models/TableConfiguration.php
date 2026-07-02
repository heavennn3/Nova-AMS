<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TableConfiguration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'table_name',
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
     * Get visible columns for a specific table.
     */
    public static function getVisibleColumns($tableName)
    {
        return self::forTable($tableName)
            ->visible()
            ->ordered()
            ->get();
    }

    /**
     * Get all columns (including hidden) for a specific table.
     */
    public static function getAllColumns($tableName)
    {
        return self::forTable($tableName)
            ->ordered()
            ->get();
    }
}
