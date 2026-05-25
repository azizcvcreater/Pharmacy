<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'fees',
        'sonography_fee',
        'ecg_fee',
        'xray_fee',
        'description',
    ];
}
