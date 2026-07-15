<?php
// app/Models/Expense.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'medicine_id',
        'amount',
        'expense_date',
        'category',
        'description',
        'admin_id',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // Get category label
    public function getCategoryLabelAttribute()
    {
        $categories = [
            'purchase' => 'Purchase',
            'utility' => 'Utility',
            'rent' => 'Rent',
            'salary' => 'Salary',
            'maintenance' => 'Maintenance',
            'other' => 'Other',
        ];
        return $categories[$this->category] ?? $this->category;
    }

    // Get category color
    public function getCategoryColorAttribute()
    {
        $colors = [
            'purchase' => 'bg-blue-100 text-blue-800',
            'utility' => 'bg-yellow-100 text-yellow-800',
            'rent' => 'bg-purple-100 text-purple-800',
            'salary' => 'bg-green-100 text-green-800',
            'maintenance' => 'bg-orange-100 text-orange-800',
            'other' => 'bg-gray-100 text-gray-800',
        ];
        return $colors[$this->category] ?? 'bg-gray-100 text-gray-800';
    }
}