<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Withdrawal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'asset_id',
        'user_id',
        'site_id',
        'withdrawal_type',
        'purpose_category',
        'purpose_description',
        'withdrawal_date',
        'expected_return_date',
        'actual_return_date',
        'duration',
        'status',
        'condition_notes',
        'return_condition',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'priority',
        'admin_notes',
    ];

    protected $casts = [
        'withdrawal_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
        'approved_at' => 'datetime',
    ];

    // Industry standard withdrawal types
    const TYPE_STANDARD = 'standard';
    const TYPE_TEMPORARY = 'temporary';
    const TYPE_PERMANENT = 'permanent';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_LOAN = 'loan';

    // Industry standard purpose categories
    const CATEGORY_OPERATIONAL = 'operational';
    const CATEGORY_PROJECT = 'project';
    const CATEGORY_MAINTENANCE = 'maintenance';
    const CATEGORY_PERSONAL = 'personal';
    const CATEGORY_EMERGENCY = 'emergency';
    const CATEGORY_TRAINING = 'training';
    const CATEGORY_REPLACEMENT = 'replacement';
    const CATEGORY_UPGRADE = 'upgrade';

    // Status options
    const STATUS_ACTIVE = 'active';
    const STATUS_RETURNED = 'returned';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_LOST = 'lost';
    const STATUS_DAMAGED = 'damaged';

    // Priority levels
    const PRIORITY_LOW = 'low';
    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function site()
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    /**
     * Calculate the duration of withdrawal in days
     */
    public function getDurationInDaysAttribute()
    {
        if (!$this->withdrawal_date) {
            return null;
        }

        $endDate = $this->actual_return_date ?: $this->expected_return_date;
        if (!$endDate) {
            return null;
        }

        return \Carbon\Carbon::parse($this->withdrawal_date)
            ->diffInDays(\Carbon\Carbon::parse($endDate));
    }

    /**
     * Check if withdrawal is overdue
     */
    public function getIsOverdueAttribute()
    {
        if (!$this->expected_return_date || $this->status !== 'active') {
            return false;
        }

        return \Carbon\Carbon::parse($this->expected_return_date)->isPast();
    }

    /**
     * Get human-readable duration
     */
    public function getHumanDurationAttribute()
    {
        if ($this->withdrawal_type === 'permanent') {
            return 'Permanent';
        }

        $days = $this->duration_in_days;
        if (!$days) {
            return 'Not specified';
        }

        if ($days < 7) {
            return "{$days} " . ($days === 1 ? 'day' : 'days');
        } elseif ($days < 30) {
            $weeks = floor($days / 7);
            $remainingDays = $days % 7;
            $result = "{$weeks} " . ($weeks === 1 ? 'week' : 'weeks');
            if ($remainingDays > 0) {
                $result .= " {$remainingDays} " . ($remainingDays === 1 ? 'day' : 'days');
            }
            return $result;
        } else {
            $months = floor($days / 30);
            $remainingDays = $days % 30;
            $result = "{$months} " . ($months === 1 ? 'month' : 'months');
            if ($remainingDays > 0) {
                $result .= " {$remainingDays} " . ($remainingDays === 1 ? 'day' : 'days');
            }
            return $result;
        }
    }

    /**
     * Get withdrawal type options for form
     */
    public static function getTypeOptions()
    {
        return [
            self::TYPE_STANDARD => 'Standard Assignment',
            self::TYPE_TEMPORARY => 'Temporary Use',
            self::TYPE_PERMANENT => 'Permanent Assignment',
            self::TYPE_MAINTENANCE => 'Maintenance/Repair',
            self::TYPE_LOAN => 'Loan/Transfer',
        ];
    }

    /**
     * Get purpose category options for form
     */
    public static function getPurposeOptions()
    {
        return [
            self::CATEGORY_OPERATIONAL => 'Operational Use',
            self::CATEGORY_PROJECT => 'Project-Based',
            self::CATEGORY_MAINTENANCE => 'Maintenance/Repair',
            self::CATEGORY_PERSONAL => 'Personal Use',
            self::CATEGORY_EMERGENCY => 'Emergency Response',
            self::CATEGORY_TRAINING => 'Training/Learning',
            self::CATEGORY_REPLACEMENT => 'Replacement Unit',
            self::CATEGORY_UPGRADE => 'System Upgrade',
        ];
    }

    /**
     * Get duration presets for common withdrawal periods
     */
    public static function getDurationPresets()
    {
        return [
            '1_day' => ['days' => 1, 'label' => '1 Day'],
            '3_days' => ['days' => 3, 'label' => '3 Days'],
            '1_week' => ['days' => 7, 'label' => '1 Week'],
            '2_weeks' => ['days' => 14, 'label' => '2 Weeks'],
            '1_month' => ['days' => 30, 'label' => '1 Month'],
            '3_months' => ['days' => 90, 'label' => '3 Months'],
            '6_months' => ['days' => 180, 'label' => '6 Months'],
            '1_year' => ['days' => 365, 'label' => '1 Year'],
            'permanent' => ['days' => null, 'label' => 'Permanent'],
        ];
    }

    /**
     * Get priority options
     */
    public static function getPriorityOptions()
    {
        return [
            self::PRIORITY_LOW => 'Low Priority',
            self::PRIORITY_NORMAL => 'Normal Priority',
            self::PRIORITY_HIGH => 'High Priority',
            self::PRIORITY_URGENT => 'Urgent',
        ];
    }

    /**
     * Scope for active withdrawals
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for overdue withdrawals
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('expected_return_date', '<', now());
    }

    /**
     * Scope for withdrawals by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}