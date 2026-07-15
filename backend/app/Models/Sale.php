<?php
// app/Models/Sale.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'invoice_number',
        'sale_date',
        'sale_type',
        'prescription_number',
        'doctor_name',
        'doctor_fees',
        'patient_name',
        'patient_phone',
        'prescription_image',
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
        'sale_date' => 'date',
        'doctor_fees' => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(SalePayment::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // IMPORTANT: This method updates payment status based on payments
    public function updatePaymentStatus()
    {
        $paidAmount = $this->payments()->sum('amount') ?? 0;
        $this->paid_amount = $paidAmount;
        $this->balance_due = $this->total - $paidAmount;

        if ($this->balance_due <= 0) {
            $this->payment_status = 'paid';
            $this->balance_due = 0;
        } elseif ($paidAmount > 0) {
            $this->payment_status = 'partial';
        } else {
            $this->payment_status = 'unpaid';
        }

        $this->save();
        return $this;
    }

    // Calculate total profit for this sale
    public function getProfitAttribute()
    {
        $totalProfit = 0;
        foreach ($this->items as $item) {
            $medicine = $item->medicine;
            if ($medicine) {
                $profitPerUnit = $item->unit_price - ($medicine->purchase_price ?? 0);
                $totalProfit += $profitPerUnit * $item->quantity;
            }
        }
        $totalProfit -= ($this->doctor_fees ?? 0);
        return $totalProfit;
    }

    public function getPaymentStatusLabelAttribute()
    {
        $labels = [
            'paid' => 'Paid',
            'partial' => 'Partial',
            'unpaid' => 'Unpaid',
        ];
        return $labels[$this->payment_status] ?? $this->payment_status;
    }

    public function getPaymentStatusColorAttribute()
    {
        $colors = [
            'paid' => 'bg-green-100 text-green-800',
            'partial' => 'bg-yellow-100 text-yellow-800',
            'unpaid' => 'bg-red-100 text-red-800',
        ];
        return $colors[$this->payment_status] ?? 'bg-gray-100 text-gray-800';
    }

    public function getSaleTypeLabelAttribute()
    {
        return $this->sale_type === 'prescription' ? 'With Prescription' : 'Without Prescription';
    }

    public function getSaleTypeColorAttribute()
    {
        return $this->sale_type === 'prescription' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800';
    }
}