<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Expense;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $sales = Sale::where('user_id', $userId)->latest()->get()->map(function ($sale) {
            return [
                'type' => 'sale',
                'id' => $sale->id,
                'amount' => $sale->total_amount ?? 0,
                'description' => 'Sale Bill: ' . $sale->bill_no,
                'date' => $sale->sale_date ?? $sale->created_at,
            ];
        });

        $purchases = Purchase::where('user_id', $userId)
            ->with('details')
            ->latest()
            ->get()
            ->map(function ($purchase) {
                return [
                    'type' => 'purchase',
                    'id' => $purchase->id,
                    'amount' => $purchase->details->sum('total_buyer_price'),
                    'description' => 'Purchase #' . $purchase->id,
                    'date' => $purchase->created_at,
                ];
            });

        $expenses = Expense::where('user_id', $userId)->latest()->get()->map(function ($expense) {
            return [
                'type' => 'expense',
                'id' => $expense->id,
                'amount' => $expense->amount ?? 0,
                'description' => 'Expense: ' . ($expense->note ?? $expense->title),
                'date' => $expense->expense_date ?? $expense->created_at,
            ];
        });

        $doctors = Doctor::where('user_id', $userId)
            ->latest()
            ->get()
            ->map(function ($doctor) {
                $total = $doctor->fees
                    + ($doctor->sonography_fee ?? 0)
                    + ($doctor->ecg_fee ?? 0)
                    + ($doctor->xray_fee ?? 0);

                $description = $doctor->name
                    ? 'Doctor Fees: ' . $doctor->name
                    : 'Doctor Fees (ID: ' . $doctor->id . ')';

                if ($doctor->description) {
                    $description .= ' - ' . $doctor->description;
                }

                return [
                    'type' => 'doctor',
                    'id' => $doctor->id,
                    'amount' => $total,
                    'description' => $description,
                    'date' => $doctor->created_at,
                ];
            });

        $transactions = collect()
            ->merge($sales)
            ->merge($purchases)
            ->merge($expenses)
            ->merge($doctors)
            ->sortByDesc('date')
            ->values();

        return response()->json($transactions);
    }
}
