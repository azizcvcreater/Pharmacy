<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'supplier_id',
    
        'user_id',
        'amount',
        'payment_date',
        'note'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
