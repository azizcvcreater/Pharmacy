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
        $suppliers = Supplier::where('pharmacy_id', Auth::user()->pharmacy_id)->get();
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
            'pharmacy_id' => Auth::user()->pharmacy_id,
        ]);

        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = Supplier::where('pharmacy_id', Auth::user()->pharmacy_id)
            ->with(['purchases', 'payments'])
            ->findOrFail($id);
        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::where('pharmacy_id', Auth::user()->pharmacy_id)->findOrFail($id);
        $supplier->update($request->only(['name', 'phone', 'address']));
        return response()->json($supplier);
    }

    public function destroy($id)
    {
        $supplier = Supplier::where('pharmacy_id', Auth::user()->pharmacy_id)->findOrFail($id);
        $supplier->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function balance($id)
{
    $supplier = Supplier::where('pharmacy_id', Auth::user()->pharmacy_id)->findOrFail($id);

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
        $ledgers = Ledger::where('supplier_id', $id)
            ->where('pharmacy_id', Auth::user()->pharmacy_id)
            ->with('reference')
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($ledgers);
    }
}
