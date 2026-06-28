<?php
// app/Models/Ledger.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ledger extends Model
{
    protected $fillable = [
        'supplier_id',

        'type',
        'amount',
        'reference_id',
        'reference_type',
        'balance',
        'transaction_date'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
