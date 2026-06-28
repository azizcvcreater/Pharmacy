<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineItem extends Model
{
    protected $fillable = [
        'user_id',
        
        'generic',
        'brand',
        'dosage',
        'strength',
        'route',
    ];

}
