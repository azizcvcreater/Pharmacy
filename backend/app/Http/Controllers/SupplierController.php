<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupplierController extends Controller
{
    public function index()
{
    try {
        if (!Auth::check()) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        $userId = Auth::id();
        $suppliers = Supplier::where('user_id', $userId)->get();

        return response()->json($suppliers);
    } catch (\Exception $e) {
        \Log::error('Supplier index error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    }
}

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'user_id' => Auth::id(),
        ]);

        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = Supplier::where('user_id', Auth::id())
            ->with(['purchases', 'payments']) // ensure these relations exist in Supplier model
            ->findOrFail($id);
        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::where('user_id', Auth::id())->findOrFail($id);
        $supplier->update($request->only(['name', 'phone', 'address']));
        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::where('user_id', Auth::id())->findOrFail($id);
        $supplier->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function balance($id)
    {
        $supplier = Supplier::where('user_id', Auth::id())->findOrFail($id);

        $totalPurchases = Ledger::where('supplier_id', $id)
            ->where('type', 'purchase')
            ->sum('amount');

        $totalPayments = Ledger::where('supplier_id', $id)
            ->where('type', 'payment')
            ->sum('amount');

        $balance = $totalPurchases - $totalPayments;

        return response()->json(['balance' => $balance]);
    }

    public function ledger($id)
    {
        // Ensure the supplier belongs to the user
        $supplier = Supplier::where('user_id', Auth::id())->findOrFail($id);

        $ledgers = Ledger::where('supplier_id', $id)
            ->where('user_id', Auth::id())
            // REMOVED ->with('reference') because it was causing errors
            // If you need reference data, define the relation properly in Ledger model first
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($ledgers);
    }
}
