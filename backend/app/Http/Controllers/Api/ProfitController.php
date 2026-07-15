<?php
// app/Http/Controllers/Api/ProfitController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Purchase;
use App\Models\Expense;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProfitController extends Controller
{
    // Get profit summary by period
    public function summary(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $period = $request->input('period', 'today');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Set date range based on period
        switch ($period) {
            case 'today':
                $startDate = Carbon::now()->startOfDay();
                $endDate = Carbon::now()->endOfDay();
                break;
            case 'weekly':
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
                break;
            case 'monthly':
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
                break;
            case 'yearly':
                $startDate = Carbon::now()->startOfYear();
                $endDate = Carbon::now()->endOfYear();
                break;
            case 'custom':
                if (!$startDate || !$endDate) {
                    return response()->json(['message' => 'Start date and end date required for custom period'], 422);
                }
                $startDate = Carbon::parse($startDate)->startOfDay();
                $endDate = Carbon::parse($endDate)->endOfDay();
                break;
            default:
                $startDate = Carbon::now()->startOfDay();
                $endDate = Carbon::now()->endOfDay();
        }

        // Sales data
        $sales = Sale::where('admin_id', $adminId)
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->get();

        $totalSales = $sales->sum('total');
        $totalSalesPaid = $sales->sum('paid_amount');
        $totalSalesBalance = $sales->sum('balance_due');
        $salesCount = $sales->count();

        // Calculate profit from sales
        $totalProfit = 0;
        foreach ($sales as $sale) {
            foreach ($sale->items as $item) {
                $medicine = $item->medicine;
                if ($medicine) {
                    $profitPerUnit = $item->unit_price - ($medicine->purchase_price ?? 0);
                    $totalProfit += $profitPerUnit * $item->quantity;
                }
            }
        }

        // Purchases data
        $purchases = Purchase::where('admin_id', $adminId)
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->get();

        $totalPurchases = $purchases->sum('total');
        $totalPurchasesPaid = $purchases->sum('paid_amount');
        $totalPurchasesBalance = $purchases->sum('balance_due');
        $purchasesCount = $purchases->count();

        // Expenses data
        $expenses = Expense::where('admin_id', $adminId)
            ->whereBetween('expense_date', [$startDate, $endDate])
            ->get();

        $totalExpenses = $expenses->sum('amount');
        $expensesCount = $expenses->count();
        $expensesByCategory = $expenses->groupBy('category')
            ->map(function ($items) {
                return $items->sum('amount');
            });

        // Net profit
        $netProfit = $totalProfit - $totalExpenses;

        return response()->json([
            'period' => $period,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'sales' => [
                'total' => $totalSales,
                'paid' => $totalSalesPaid,
                'balance' => $totalSalesBalance,
                'count' => $salesCount,
            ],
            'purchases' => [
                'total' => $totalPurchases,
                'paid' => $totalPurchasesPaid,
                'balance' => $totalPurchasesBalance,
                'count' => $purchasesCount,
            ],
            'profit' => [
                'gross_profit' => $totalProfit,
                'total_expenses' => $totalExpenses,
                'net_profit' => $netProfit,
                'expenses_count' => $expensesCount,
                'expenses_by_category' => $expensesByCategory,
            ],
        ]);
    }

    // Get detailed profit report by date range
    public function report(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $period = $request->input('period', 'weekly');
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $startDate = Carbon::now();
        $endDate = Carbon::now();

        switch ($period) {
            case 'daily':
                $startDate = Carbon::parse($year . '-' . $month . '-01');
                $endDate = $startDate->copy()->endOfMonth();
                $groupBy = 'day';
                $dateFormat = 'Y-m-d';
                $labelFormat = 'd M';
                break;
            case 'weekly':
                $startDate = Carbon::parse($year . '-01-01');
                $endDate = $startDate->copy()->endOfYear();
                $groupBy = 'week';
                $dateFormat = 'Y-W';
                $labelFormat = 'Week W';
                break;
            case 'monthly':
                $startDate = Carbon::parse($year . '-01-01');
                $endDate = $startDate->copy()->endOfYear();
                $groupBy = 'month';
                $dateFormat = 'Y-m';
                $labelFormat = 'M Y';
                break;
            case 'yearly':
                $startDate = Carbon::parse($year . '-01-01');
                $endDate = $startDate->copy()->endOfYear();
                $groupBy = 'year';
                $dateFormat = 'Y';
                $labelFormat = 'Y';
                break;
            default:
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
                $groupBy = 'day';
                $dateFormat = 'Y-m-d';
                $labelFormat = 'd M';
        }

        // Get sales grouped by period
        $salesData = Sale::where('admin_id', $adminId)
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($sale) use ($groupBy) {
                return $sale->sale_date->format('Y-m-d');
            });

        $reportData = [];
        $dateRange = $startDate->copy();

        while ($dateRange <= $endDate) {
            $key = $dateRange->format('Y-m-d');
            $sales = $salesData->get($key, collect());

            $totalProfit = 0;
            foreach ($sales as $sale) {
                foreach ($sale->items as $item) {
                    $medicine = $item->medicine;
                    if ($medicine) {
                        $profitPerUnit = $item->unit_price - ($medicine->purchase_price ?? 0);
                        $totalProfit += $profitPerUnit * $item->quantity;
                    }
                }
            }

            $expenses = Expense::where('admin_id', $adminId)
                ->whereDate('expense_date', $key)
                ->sum('amount');

            $reportData[] = [
                'date' => $key,
                'label' => $dateRange->format('d M Y'),
                'sales_count' => $sales->count(),
                'sales_total' => $sales->sum('total'),
                'gross_profit' => $totalProfit,
                'expenses' => $expenses,
                'net_profit' => $totalProfit - $expenses,
            ];

            $dateRange->addDay();
        }

        return response()->json([
            'period' => $period,
            'year' => $year,
            'month' => $month,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'data' => $reportData,
            'summary' => [
                'total_sales' => collect($reportData)->sum('sales_total'),
                'total_gross_profit' => collect($reportData)->sum('gross_profit'),
                'total_expenses' => collect($reportData)->sum('expenses'),
                'total_net_profit' => collect($reportData)->sum('net_profit'),
            ],
        ]);
    }
}