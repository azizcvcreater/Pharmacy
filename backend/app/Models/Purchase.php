<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'invoice_number',
        'supplier_id',
        'purchase_date',
        'due_date',
        'subtotal',
        'tax',
        'discount',
        'total',
        'paid_amount',
        'balance_due',
        'payment_status',
        'notes',
        'admin_id',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'due_date' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class, 'purchase_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}