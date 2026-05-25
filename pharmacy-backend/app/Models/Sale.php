<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
    'user_id',
    
    'bill_no',
    'patient_name',
    'sale_date',
    'total_amount',
    'paid_amount',
    'due_amount',
    'payment_status'
];

    public function details()
    {
        return $this->hasMany(SaleDetail::class);
    }
}
