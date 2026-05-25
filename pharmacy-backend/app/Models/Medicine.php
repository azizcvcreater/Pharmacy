<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
protected $fillable = [
    'user_id',
    'supplier_id',
    
    'generic',
    'brand',
    'dosage',
    'strength',
    'route',
    'quantity',
    'buy_price',
    'total_buyer_price',
    'sale_price',
    'expiry_date',
];

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function saleDetails()
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function supplier()
{
    return $this->belongsTo(Supplier::class);
}
}
