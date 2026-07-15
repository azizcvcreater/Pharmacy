<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'address',
        'admin_id',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    // Total purchases from supplier (goods received)
    public function getTotalPurchasesAttribute()
    {
        return $this->purchases()->sum('total') ?? 0;
    }

    // Total paid to supplier (money sent to supplier)
    public function getTotalPaidAttribute()
    {
        return $this->payments()->sum('amount') ?? 0;
    }

    // Balance = Purchases - Payments
    // Positive = Credit (You owe supplier)
    // Negative = Debit (Supplier owes you)
    public function getBalanceAttribute()
    {
        return $this->total_purchases - $this->total_paid;
    }

    // Get formatted balance with Debit/Credit label
    public function getFormattedBalanceAttribute()
    {
        $balance = $this->balance;
        if ($balance > 0) {
            return [
                'amount' => $balance,
                'formatted' => '$' . number_format($balance, 2) . ' (Credit)',
                'status' => 'credit',
                'label' => 'Credit',
                'color' => 'text-red-600',
                'bg' => 'bg-red-50 border-red-200',
                'badge' => 'bg-red-100 text-red-800',
                'description' => 'You owe this supplier'
            ];
        } elseif ($balance < 0) {
            return [
                'amount' => $balance,
                'formatted' => '$' . number_format(abs($balance), 2) . ' (Debit)',
                'status' => 'debit',
                'label' => 'Debit',
                'color' => 'text-green-600',
                'bg' => 'bg-green-50 border-green-200',
                'badge' => 'bg-green-100 text-green-800',
                'description' => 'This supplier owes you'
            ];
        }
        return [
            'amount' => 0,
            'formatted' => '$0.00 (Balanced)',
            'status' => 'zero',
            'label' => 'Balanced',
            'color' => 'text-gray-600',
            'bg' => 'bg-gray-50 border-gray-200',
            'badge' => 'bg-gray-100 text-gray-800',
            'description' => 'All settled'
        ];
    }

    public function getPaymentCountAttribute()
    {
        return $this->payments()->count();
    }

    public function getPurchaseCountAttribute()
    {
        return $this->purchases()->count();
    }

    public function getLastPaymentAttribute()
    {
        return $this->payments()->latest()->first();
    }

    public function getLastPurchaseAttribute()
    {
        return $this->purchases()->latest()->first();
    }
}