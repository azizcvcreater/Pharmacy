<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Expense;
use App\Models\Medicine;
use App\Models\PurchaseDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Purchases – assuming PurchaseDetail belongs to a purchase that has user_id
        $totalPurchases = PurchaseDetail::whereHas('purchase', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->sum('total_buyer_price');

        $totalProfit = PurchaseDetail::whereHas('purchase', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->sum('total_profit');

        // Expenses
        $totalExpenses = Expense::where('user_id', $userId)->sum('amount');

        $netProfit = $totalProfit - $totalExpenses;

        // Medicines low stock (quantity < 100 and > 0)
        $lowStock = Medicine::where('user_id', $userId)
            ->where('quantity', '>', 0)
            ->where('quantity', '<', 100)
            ->get();

        // Near expiry (next 45 days)
        $nearExpiry = Medicine::where('user_id', $userId)
            ->whereNotNull('expiry_date')
            ->where('quantity', '>', 0)
            ->whereBetween('expiry_date', [
                Carbon::today(),
                Carbon::today()->addDays(45)
            ])
            ->orderBy('expiry_date')
            ->get(['id', 'generic', 'expiry_date', 'quantity as stock_quantity']);

        // Doctor totals
        $totalConsultationFees = Doctor::where('user_id', $userId)->sum('fees');
        $totalSonographyFees   = Doctor::where('user_id', $userId)->sum('sonography_fee');
        $totalEcgFees          = Doctor::where('user_id', $userId)->sum('ecg_fee');
        $totalXrayFees         = Doctor::where('user_id', $userId)->sum('xray_fee');

        $totalDoctorIncome = $totalConsultationFees + $totalSonographyFees + $totalEcgFees + $totalXrayFees;

        return response()->json([
            'totalPurchases'        => $totalPurchases,
            'totalProfit'           => $totalProfit,
            'totalExpenses'         => $totalExpenses,
            'netProfit'             => $netProfit,
            'lowStock'              => $lowStock,
            'nearExpiry'            => $nearExpiry,
            'totalConsultationFees' => $totalConsultationFees,
            'totalSonographyFees'   => $totalSonographyFees,
            'totalEcgFees'          => $totalEcgFees,
            'totalXrayFees'         => $totalXrayFees,
            'totalDoctorIncome'     => $totalDoctorIncome,
        ]);
    }
}
