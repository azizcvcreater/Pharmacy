<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleDetail extends Model
{
protected $fillable = [
    'sale_id',
    'medicine_id',
    'quantity',
    'unit_price',
    'total_unit_price',
];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

}
