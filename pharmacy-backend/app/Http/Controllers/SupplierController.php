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
        $suppliers = Supplier::where('user_id', Auth::id())->get();
        return response()->json($suppliers);
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
            ->with(['purchases', 'payments'])
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
            ->where('user_id', Auth::id())   // ledger table also has user_id
            ->with('reference')
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($ledgers);
    }
}
