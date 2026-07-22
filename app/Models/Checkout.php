<?php

namespace App\Models;

use OwenIt\Auditing\Contracts\Auditable;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Checkout extends Model
implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $fillable = [
        'spare_part_id',
        'user_id',
        'quantity',
        'purpose',
        'checkout_date',
        'return_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'checkout_date' => 'date',
            'return_date' => 'date',
        ];
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
