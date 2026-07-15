<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'medicine_id',
        'quantity',
        'unit_price',
        'total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    // Calculate profit for this sale item
    public function getProfitAttribute()
    {
        $medicine = $this->medicine;
        if (!$medicine) return 0;
        $profitPerUnit = $this->unit_price - ($medicine->purchase_price ?? 0);
        return $profitPerUnit * $this->quantity;
    }

    // Get purchase price for this item
    public function getPurchasePriceAttribute()
    {
        $medicine = $this->medicine;
        return $medicine ? $medicine->purchase_price : 0;
    }
}