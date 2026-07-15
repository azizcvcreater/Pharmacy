<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $query = SupplierPayment::with('supplier')
            ->where('admin_id', $adminId);

        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
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
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,check,credit_card,online',
            'notes' => 'nullable|string|max:500',
            'reference_number' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $supplier = Supplier::where('id', $request->supplier_id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found or unauthorized'], 404);
        }

        $payment = SupplierPayment::create([
            'supplier_id' => $request->supplier_id,
            'purchase_id' => $request->purchase_id ?? null,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
            'reference_number' => $request->reference_number,
            'admin_id' => $adminId,
        ]);

        return response()->json($payment, 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $payment = SupplierPayment::with('supplier')
            ->where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $payment = SupplierPayment::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_date' => 'sometimes|date',
            'payment_method' => 'sometimes|in:cash,bank_transfer,check,credit_card,online',
            'notes' => 'nullable|string|max:500',
            'reference_number' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment->update($request->only([
            'amount', 'payment_date', 'payment_method', 'notes', 'reference_number'
        ]));

        return response()->json($payment);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $payment = SupplierPayment::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }

    public function summary(Request $request, $supplierId)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $supplier = Supplier::where('id', $supplierId)
                ->where('admin_id', $adminId)
                ->first();

            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            $totalPaid = $supplier->payments()->sum('amount') ?? 0;
            $totalPurchases = $supplier->purchases()->sum('total') ?? 0;
            $balance = $totalPurchases - $totalPaid;

            if ($balance > 0) {
                $status = 'credit';
                $statusLabel = 'Credit';
                $statusColor = 'text-red-600';
                $statusBg = 'bg-red-50 border-red-200';
                $description = 'You owe this supplier';
            } elseif ($balance < 0) {
                $status = 'debit';
                $statusLabel = 'Debit';
                $statusColor = 'text-green-600';
                $statusBg = 'bg-green-50 border-green-200';
                $description = 'This supplier owes you';
            } else {
                $status = 'zero';
                $statusLabel = 'Balanced';
                $statusColor = 'text-gray-600';
                $statusBg = 'bg-gray-50 border-gray-200';
                $description = 'All settled';
            }

            return response()->json([
                'supplier' => $supplier,
                'total_paid' => $totalPaid,
                'total_purchases' => $totalPurchases,
                'balance' => $balance,
                'balance_formatted' => '$' . number_format(abs($balance), 2) . ' (' . $statusLabel . ')',
                'status' => $status,
                'status_label' => $statusLabel,
                'status_color' => $statusColor,
                'status_bg' => $statusBg,
                'description' => $description,
                'payment_count' => $supplier->payments()->count(),
                'purchase_count' => $supplier->purchases()->count(),
                'last_payment' => $supplier->payments()->latest()->first(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Supplier payment summary error: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching summary: ' . $e->getMessage()], 500);
        }
    }
}