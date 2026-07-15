<?php
// app/Http/Controllers/Api/SaleController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $perPage = $request->input('limit', 10);
            $search = $request->input('search');
            $status = $request->input('status');
            $type = $request->input('type');

            $query = Sale::with(['items.medicine'])
                ->where('admin_id', $adminId);

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('invoice_number', 'LIKE', "%{$search}%")
                      ->orWhere('patient_name', 'LIKE', "%{$search}%")
                      ->orWhere('doctor_name', 'LIKE', "%{$search}%")
                      ->orWhereHas('items.medicine', function($sq) use ($search) {
                          $sq->where('generic', 'LIKE', "%{$search}%")
                            ->orWhere('brand', 'LIKE', "%{$search}%");
                      });
                });
            }

            if ($status) {
                $query->where('payment_status', $status);
            }

            if ($type) {
                $query->where('sale_type', $type);
            }

            $sales = $query->latest()->paginate($perPage);

            return response()->json([
                'data' => $sales->items(),
                'total' => $sales->total(),
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Sale index error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading sales: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $validator = Validator::make($request->all(), [
                'sale_date' => 'required|date',
                'sale_type' => 'required|in:prescription,non_prescription',
                'prescription_number' => 'required_if:sale_type,prescription|nullable|string|max:100',
                'doctor_name' => 'required_if:sale_type,prescription|nullable|string|max:255',
                'doctor_fees' => 'nullable|numeric|min:0', // Add this
                'patient_name' => 'required_if:sale_type,prescription|nullable|string|max:255',
                'patient_phone' => 'nullable|string|max:20',
                'items' => 'required|array|min:1',
                'items.*.medicine_id' => 'required|exists:medicines,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'paid_amount' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            $subtotal = 0;
            $items = [];
            
            foreach ($request->items as $item) {
                $medicine = Medicine::where('id', $item['medicine_id'])
                    ->where('admin_id', $adminId)
                    ->first();
                    
                if (!$medicine) {
                    throw new \Exception('Medicine not found: ' . $item['medicine_id']);
                }
                
                if (!$medicine->hasStock($item['quantity'])) {
                    throw new \Exception('Insufficient stock for ' . $medicine->generic . '. Available: ' . $medicine->stock . ', Requested: ' . $item['quantity']);
                }

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
            $doctorFees = $request->doctor_fees ?? 0;
            $total = $subtotal - $discount + $tax + $doctorFees; // Add doctor fees to total
            $paidAmount = $request->paid_amount ?? 0;
            $balanceDue = $total - $paidAmount;

            $status = 'unpaid';
            if ($balanceDue <= 0) {
                $status = 'paid';
                $balanceDue = 0;
            } elseif ($paidAmount > 0) {
                $status = 'partial';
            }

            $invoiceNumber = 'SALE-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // Handle prescription image
            $prescriptionImage = null;
            if ($request->has('prescription_image') && $request->prescription_image) {
                $imageData = $request->prescription_image;
                if (strpos($imageData, 'data:image') === 0) {
                    $image = str_replace('data:image/jpeg;base64,', '', $imageData);
                    $image = str_replace('data:image/png;base64,', '', $image);
                    $image = str_replace(' ', '+', $image);
                    $imageName = 'prescription_' . time() . '.jpg';
                    $path = storage_path('app/public/prescriptions/' . $imageName);
                    \File::ensureDirectoryExists(dirname($path));
                    file_put_contents($path, base64_decode($image));
                    $prescriptionImage = 'storage/prescriptions/' . $imageName;
                }
            }

            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'sale_date' => $request->sale_date,
                'sale_type' => $request->sale_type,
                'prescription_number' => $request->prescription_number,
                'doctor_name' => $request->doctor_name,
                'doctor_fees' => $doctorFees, // Add this
                'patient_name' => $request->patient_name,
                'patient_phone' => $request->patient_phone,
                'prescription_image' => $prescriptionImage,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'balance_due' => $balanceDue,
                'payment_status' => $status,
                'notes' => $request->notes,
                'admin_id' => $adminId,
            ]);

            foreach ($items as $item) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['total'],
                ]);

                $medicine = Medicine::find($item['medicine_id']);
                if ($medicine) {
                    $medicine->removeStock($item['quantity']);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Sale created successfully and stock updated',
                'sale' => $sale->load('items.medicine')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Sale store error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $sale = Sale::with(['items.medicine'])
                ->where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$sale) {
                return response()->json(['message' => 'Sale not found'], 404);
            }

            return response()->json($sale);
        } catch (\Exception $e) {
            \Log::error('Sale show error: ' . $e->getMessage());
            return response()->json(['message' => 'Error loading sale: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

            $sale = Sale::where('id', $id)
                ->where('admin_id', $adminId)
                ->first();

            if (!$sale) {
                return response()->json(['message' => 'Sale not found'], 404);
            }

            DB::beginTransaction();

            foreach ($sale->items as $item) {
                $medicine = Medicine::find($item->medicine_id);
                if ($medicine) {
                    $medicine->addStock($item->quantity);
                }
            }

            $sale->items()->delete();
            $sale->delete();

            DB::commit();

            return response()->json(['message' => 'Sale deleted successfully and stock restored']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Sale destroy error: ' . $e->getMessage());
            return response()->json(['message' => 'Error deleting sale: ' . $e->getMessage()], 500);
        }
    }
}