<?php
// app/Http/Controllers/Api/SalePaymentController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalePaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $query = SalePayment::with(['sale', 'sale.items.medicine'])
            ->where('admin_id', $adminId);

        if ($request->has('sale_id') && $request->sale_id) {
            $query->where('sale_id', $request->sale_id);
        }

        $perPage = $request->input('limit', 10);
        $payments = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $payments->items(),
            'total' => $payments->total(),
            'current_page' => $payments->currentPage(),
            'last_page' => $payments->lastPage(),
            'per_page' => $payments->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $validator = Validator::make($request->all(), [
            'sale_id' => 'required|exists:sales,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check,credit_card,online',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if sale belongs to this admin
        $sale = Sale::where('id', $request->sale_id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$sale) {
            return response()->json(['message' => 'Sale not found or unauthorized'], 404);
        }

        // Check if amount exceeds balance
        if ($request->amount > $sale->balance_due) {
            return response()->json([
                'message' => 'Amount exceeds balance due. Balance: $' . number_format($sale->balance_due, 2)
            ], 422);
        }

        $payment = SalePayment::create([
            'sale_id' => $request->sale_id,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'notes' => $request->notes,
            'admin_id' => $adminId,
        ]);

        // Update sale payment status
        $sale->updatePaymentStatus();

        return response()->json([
            'message' => 'Payment recorded successfully',
            'payment' => $payment,
            'sale' => $sale->fresh(['items.medicine', 'payments'])
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $payment = SalePayment::with(['sale', 'sale.items.medicine'])
            ->where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $payment = SalePayment::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $sale = $payment->sale;
        $payment->delete();

        // Update sale payment status
        if ($sale) {
            $sale->updatePaymentStatus();
        }

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}