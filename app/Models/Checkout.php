<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checkout extends Model
{
    protected $fillable = [
        'spare_part_id',
        'user_id',
        'quantity',
        'purpose',
        'checkout_date',
        'expected_return_date',
        'actual_return_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'checkout_date' => 'datetime',
        'expected_return_date' => 'datetime',
        'actual_return_date' => 'datetime',
    ];

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}