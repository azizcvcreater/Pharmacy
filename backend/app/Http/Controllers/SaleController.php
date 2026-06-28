<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleDetail;
use App\Models\Medicine;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::where('user_id', Auth::id())->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('payment_status', $request->status);
        }

        return response()->json($query->paginate(10));
    }

    public function show($id)
    {
        $sale = Sale::where('user_id', Auth::id())
            ->with('details.medicine')
            ->findOrFail($id);

        $sale->details->each(function ($detail) {
            if ($detail->medicine) {
                $detail->medicine->original_quantity =
                    $detail->medicine->quantity + $detail->quantity;
            }
        });

        return response()->json($sale);
    }

    public function formData()
    {
        return response()->json(
            Medicine::where('user_id', Auth::id())->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'bill_no' => 'required|string',
            'patient_name' => 'nullable|string',
            'sale_date' => 'required|date',
            'paid_amount' => 'nullable|numeric|min:0',
            'medicines' => 'required|array'
        ]);

        $totalAmount = 0;

        foreach ($request->medicines as $row) {
            if (!$row['medicine_id'] || $row['quantity'] <= 0) continue;

            $medicine = Medicine::where('user_id', Auth::id())
                ->find($row['medicine_id']);

            if (!$medicine) {
                return response()->json(['error' => 'Invalid medicine'], 400);
            }

            if ($medicine->quantity <= 0) {
                return response()->json([
                    'error' => 'Medicine ' . $medicine->name . ' out of stock'
                ], 400);
            }

            if ($row['quantity'] > $medicine->quantity) {
                return response()->json([
                    'error' => 'Not enough stock for ' . $medicine->name
                ], 400);
            }

            $totalAmount += $row['quantity'] * $medicine->sale_price;
        }

        $paidAmount = $request->paid_amount ?? 0;
        $dueAmount = $totalAmount - $paidAmount;

        $status = $paidAmount == 0 ? 'pending'
            : ($paidAmount < $totalAmount ? 'partial' : 'paid');

        $sale = Sale::create([
            'user_id' => Auth::id(),
            'bill_no' => $request->bill_no,
            'patient_name' => $request->patient_name,
            'sale_date' => $request->sale_date,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'payment_status' => $status
        ]);

        foreach ($request->medicines as $row) {
            if (!$row['medicine_id'] || $row['quantity'] <= 0) continue;

            $medicine = Medicine::where('user_id', Auth::id())
                ->find($row['medicine_id']);

            SaleDetail::create([
                'sale_id' => $sale->id,
                'medicine_id' => $row['medicine_id'],
                'quantity' => $row['quantity']
            ]);

            $medicine->quantity -= $row['quantity'];
            $medicine->save();
        }

        return response()->json(['message' => 'Sale saved successfully']);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::where('user_id', Auth::id())
            ->with('details')
            ->findOrFail($id);

        // Restore old quantities
        foreach ($sale->details as $detail) {
            $medicine = Medicine::where('user_id', Auth::id())
                ->find($detail->medicine_id);
            if ($medicine) {
                $medicine->quantity += $detail->quantity;
                $medicine->save();
            }
        }
        SaleDetail::where('sale_id', $sale->id)->delete();

        $totalAmount = 0;

        foreach ($request->medicines as $row) {
            if (!$row['medicine_id'] || $row['quantity'] <= 0) continue;

            $medicine = Medicine::where('user_id', Auth::id())
                ->find($row['medicine_id']);
            if (!$medicine) continue;

            if ($row['quantity'] > $medicine->quantity) {
                return response()->json([
                    'error' => 'Not enough stock for ' . $medicine->name
                ], 422);
            }
            $totalAmount += $row['quantity'] * $medicine->sale_price;
        }

        $paidAmount = $request->paid_amount ?? 0;
        $dueAmount = $totalAmount - $paidAmount;
        $status = $paidAmount == 0 ? 'pending'
            : ($paidAmount < $totalAmount ? 'partial' : 'paid');

        $sale->update([
            'bill_no' => $request->bill_no,
            'patient_name' => $request->patient_name,
            'sale_date' => $request->sale_date,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'due_amount' => $dueAmount,
            'payment_status' => $status
        ]);

        foreach ($request->medicines as $row) {
            if (!$row['medicine_id'] || !$row['quantity']) continue;
            $medicine = Medicine::where('user_id', Auth::id())->find($row['medicine_id']);
            if (!$medicine) continue;

            SaleDetail::create([
                'sale_id' => $sale->id,
                'medicine_id' => $row['medicine_id'],
                'quantity' => $row['quantity'],
            ]);
            $medicine->quantity -= $row['quantity'];
            $medicine->save();
        }

        return response()->json(['message' => 'Sale updated successfully']);
    }

    public function destroy($id)
    {
        $sale = Sale::where('user_id', Auth::id())
            ->with('details')
            ->findOrFail($id);

        foreach ($sale->details as $detail) {
            $medicine = Medicine::where('user_id', Auth::id())
                ->find($detail->medicine_id);
            if ($medicine) {
                $medicine->quantity += $detail->quantity;
                $medicine->save();
            }
        }
        SaleDetail::where('sale_id', $sale->id)->delete();
        $sale->delete();

        return response()->json(['message' => 'Sale deleted successfully']);
    }

    public function saleTableReport(Request $request)
    {
        $status = $request->query('status');
        $query = Sale::where('user_id', Auth::id());
        if ($status && $status !== 'all') {
            $query->where('payment_status', $status);
        }
        $sales = $query->orderBy('id', 'desc')->get();
        $currentDateTime = Carbon::now('Asia/Kabul')->format('F j, Y, g:i A');
        $pdf = Pdf::loadView('reports.sale-table', [
            'sales' => $sales,
            'status' => $status ?? 'all',
            'currentDateTime' => $currentDateTime,
        ]);
        return $pdf->download('sale-report.pdf');
    }
}
