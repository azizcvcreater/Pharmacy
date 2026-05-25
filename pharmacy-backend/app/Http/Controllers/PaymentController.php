<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Supplier;
use App\Traits\LedgerTrait;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    use LedgerTrait;

    public function index()
    {
        $payments = Payment::where('user_id', Auth::id())
            ->with('supplier')
            ->latest()
            ->paginate(10);
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'note' => 'nullable|string'
        ]);

        // Verify supplier belongs to this user (optional, but good for security)
        $supplier = Supplier::where('id', $request->supplier_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Invalid supplier'], 422);
        }

        $payment = Payment::create([
            'supplier_id' => $request->supplier_id,
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'note' => $request->note,
        ]);

        $this->updateLedger($request->supplier_id, 'payment', $request->amount, $payment, $request->payment_date);

        return response()->json([
            'success' => true,
            'payment' => $payment
        ]);
    }

    public function show($id)
    {
        $payment = Payment::where('user_id', Auth::id())
            ->with('supplier')
            ->findOrFail($id);
        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'note' => 'nullable|string'
        ]);

        $payment = Payment::where('user_id', Auth::id())->findOrFail($id);

        $supplier = Supplier::where('id', $request->supplier_id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Invalid supplier'], 422);
        }

        // Delete old ledger entries
        $this->deleteLedgerEntries($payment);

        $payment->update([
            'supplier_id' => $request->supplier_id,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'note' => $request->note,
        ]);

        // Create new ledger entry
        $this->updateLedger($request->supplier_id, 'payment', $request->amount, $payment, $request->payment_date);

        return response()->json([
            'success' => true,
            'payment' => $payment
        ]);
    }

    public function destroy($id)
    {
        $payment = Payment::where('user_id', Auth::id())->findOrFail($id);
        $this->deleteLedgerEntries($payment);
        $payment->delete();
        return response()->json([
            'success' => true,
            'message' => 'Payment deleted successfully'
        ]);
    }
}
