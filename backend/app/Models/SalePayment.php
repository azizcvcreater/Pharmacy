<?php
// app/Models/SalePayment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalePayment extends Model
{
    protected $fillable = [
        'sale_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'admin_id',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}