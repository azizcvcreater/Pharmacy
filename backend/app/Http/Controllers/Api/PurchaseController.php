<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Medicine;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $perPage = $request->input('limit', 10);
            $search = $request->input('search');
            $status = $request->input('status');

            $query = Purchase::with(['supplier', 'items.medicine'])
                ->where('admin_id', $adminId);

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('invoice_number', 'LIKE', "%{$search}%")
                      ->orWhereHas('supplier', function($sq) use ($search) {
                          $sq->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }

            if ($status) {
                $query->where('payment_status', $status);
            }

            $purchases = $query->latest()->paginate($perPage);

            return response()->json([
                'data' => $purchases->items(),
                'total' => $purchases->total(),
                'current_page' => $purchases->currentPage(),
                'last_page' => $purchases->lastPage(),
                'per_page' => $purchases->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Purchase index error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading purchases: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $validator = Validator::make($request->all(), [
                'supplier_id' => 'required|exists:suppliers,id',
                'purchase_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:purchase_date',
                'items' => 'required|array|min:1',
                'items.*.medicine_id' => 'required|exists:medicines,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Verify supplier belongs to this admin
            $supplier = Supplier::where('id', $request->supplier_id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$supplier) {
                return response()->json(['message' => 'Supplier not found or unauthorized'], 404);
            }

            DB::beginTransaction();

            // Calculate totals
            $subtotal = 0;
            $items = [];
            
            foreach ($request->items as $item) {
                $total = $item['quantity'] * $item['unit_price'];
                $subtotal += $total;
                $items[] = [
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $total,
                ];
            }

            $discount = $request->discount ?? 0;
            $tax = $request->tax ?? 0;
            $total = $subtotal - $discount + $tax;

            // Generate invoice number
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Create purchase
            $purchase = Purchase::create([
                'invoice_number' => $invoiceNumber,
                'supplier_id' => $request->supplier_id,
                'purchase_date' => $request->purchase_date,
                'due_date' => $request->due_date,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'paid_amount' => 0,
                'balance_due' => $total,
                'payment_status' => 'unpaid',
                'notes' => $request->notes,
                'admin_id' => $adminId,
            ]);

            // Create purchase items and update stock
            foreach ($items as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                ]);

                // Add stock to medicine
                $medicine = Medicine::find($item['medicine_id']);
                if ($medicine) {
                    $medicine->addStock($item['quantity']);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Purchase created successfully and stock updated',
                'purchase' => $purchase->load('items.medicine', 'supplier')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Purchase store error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create purchase: ' . $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $purchase = Purchase::with(['supplier', 'items.medicine', 'payments'])
                ->where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$purchase) {
                return response()->json(['message' => 'Purchase not found'], 404);
            }

            return response()->json($purchase);
        } catch (\Exception $e) {
            \Log::error('Purchase show error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading purchase: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $purchase = Purchase::where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$purchase) {
                return response()->json(['message' => 'Purchase not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'due_date' => 'nullable|date',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $purchase->update($request->only(['due_date', 'notes']));

            return response()->json($purchase->load('supplier', 'items.medicine'));
        } catch (\Exception $e) {
            \Log::error('Purchase update error: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating purchase: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $purchase = Purchase::where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$purchase) {
                return response()->json(['message' => 'Purchase not found'], 404);
            }

            if ($purchase->payments()->count() > 0) {
                return response()->json(['message' => 'Cannot delete purchase with payments'], 400);
            }

            DB::beginTransaction();

            // Remove stock when purchase is deleted
            foreach ($purchase->items as $item) {
                $medicine = Medicine::find($item->medicine_id);
                if ($medicine) {
                    $medicine->removeStock($item->quantity);
                }
            }

            $purchase->items()->delete();
            $purchase->delete();

            DB::commit();

            return response()->json(['message' => 'Purchase deleted successfully and stock restored']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Purchase destroy error: ' . $e->getMessage());
            return response()->json(['message' => 'Error deleting purchase: ' . $e->getMessage()], 500);
        }
    }

    public function applyPayment(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $purchase = Purchase::where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$purchase) {
                return response()->json(['message' => 'Purchase not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01|max:' . $purchase->balance_due,
                'payment_date' => 'required|date',
                'payment_method' => 'required|in:cash,bank_transfer,check,credit_card,online',
                'reference_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            // Create payment
            $payment = SupplierPayment::create([
                'supplier_id' => $purchase->supplier_id,
                'purchase_id' => $purchase->id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
                'admin_id' => $adminId,
            ]);

            // Update purchase
            $paidAmount = $purchase->paid_amount + $request->amount;
            $balanceDue = $purchase->total - $paidAmount;

            $status = 'unpaid';
            if ($balanceDue <= 0) {
                $status = 'paid';
                $balanceDue = 0;
            } elseif ($paidAmount > 0) {
                $status = 'partial';
            }

            $purchase->update([
                'paid_amount' => $paidAmount,
                'balance_due' => $balanceDue,
                'payment_status' => $status,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Payment applied successfully',
                'payment' => $payment,
                'purchase' => $purchase->fresh(['supplier', 'items.medicine', 'payments'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Purchase applyPayment error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to apply payment: ' . $e->getMessage()], 500);
        }
    }
}