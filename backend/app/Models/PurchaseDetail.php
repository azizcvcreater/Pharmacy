<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
   protected $fillable = [
    'purchase_id',
    'quantity',
    'generic',
    'brand',
    'dosage',
    'strength',
    'route',
    'buy_price',
    'total_buyer_price',
    'profit_per_unit',
    'total_profit',
    'sale_price',
    'expiry_date',
];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function purchase()
{
    return $this->belongsTo(Purchase::class);
}
}
