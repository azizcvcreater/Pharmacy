<?php
// app/Http/Controllers/Api/MedicineController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MedicineController extends Controller
{
    // GET all medicines
    public function index(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $perPage = $request->input('limit', 5);
        $search = $request->input('search');
        $expiryFilter = $request->input('expiry_filter'); // expired, near_expiry, all
        
        $query = Medicine::where('admin_id', $adminId);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('generic', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('route', 'LIKE', "%{$search}%")
                  ->orWhere('batch_number', 'LIKE', "%{$search}%");
            });
        }

        // Filter by expiry status
        if ($expiryFilter === 'expired') {
            $query->where('expiry_date', '<', Carbon::now());
        } elseif ($expiryFilter === 'near_expiry') {
            $query->whereBetween('expiry_date', [Carbon::now(), Carbon::now()->addDays(30)]);
        }
        
        $medicines = $query->latest()->paginate($perPage);

        // Add expiry status to each medicine
        $medicines->getCollection()->transform(function ($medicine) {
            $medicine->expiry_status = $medicine->expiry_status;
            return $medicine;
        });
        
        return response()->json([
            'data' => $medicines->items(),
            'total' => $medicines->total(),
            'current_page' => $medicines->currentPage(),
            'last_page' => $medicines->lastPage(),
            'per_page' => $medicines->perPage(),
            'expiry_stats' => [
                'total' => Medicine::where('admin_id', $adminId)->count(),
                'expired' => Medicine::where('admin_id', $adminId)->where('expiry_date', '<', Carbon::now())->count(),
                'near_expiry' => Medicine::where('admin_id', $adminId)
                    ->whereBetween('expiry_date', [Carbon::now(), Carbon::now()->addDays(30)])
                    ->count(),
                'valid' => Medicine::where('admin_id', $adminId)
                    ->where(function($q) {
                        $q->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>', Carbon::now()->addDays(30));
                    })
                    ->count(),
            ],
        ]);
    }

    // STORE new medicine
    public function store(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $validator = Validator::make($request->all(), [
            'generic' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'strength' => 'required|string|max:255',
            'route' => 'required|string|max:255',
            'stock' => 'nullable|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'batch_number' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $medicine = Medicine::create([
            'generic' => $request->generic,
            'brand' => $request->brand,
            'dosage' => $request->dosage,
            'strength' => $request->strength,
            'route' => $request->route,
            'stock' => $request->stock ?? 0,
            'purchase_price' => $request->purchase_price ?? 0,
            'selling_price' => $request->selling_price ?? 0,
            'expiry_date' => $request->expiry_date,
            'batch_number' => $request->batch_number,
            'admin_id' => $adminId,
        ]);

        return response()->json($medicine, 201);
    }

    // SHOW single medicine
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $medicine = Medicine::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$medicine) {
            return response()->json(['message' => 'Medicine not found'], 404);
        }

        return response()->json($medicine);
    }

    // UPDATE medicine
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $medicine = Medicine::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$medicine) {
            return response()->json(['message' => 'Medicine not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'generic' => 'sometimes|string|max:255',
            'brand' => 'sometimes|string|max:255',
            'dosage' => 'sometimes|string|max:255',
            'strength' => 'sometimes|string|max:255',
            'route' => 'sometimes|string|max:255',
            'stock' => 'nullable|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'expiry_date' => 'nullable|date|after:today',
            'batch_number' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $medicine->update($request->only([
            'generic', 'brand', 'dosage', 'strength', 'route',
            'stock', 'purchase_price', 'selling_price',
            'expiry_date', 'batch_number'
        ]));

        return response()->json($medicine);
    }

    // DELETE medicine
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $medicine = Medicine::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$medicine) {
            return response()->json(['message' => 'Medicine not found'], 404);
        }

        $medicine->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    // Get stock summary
    public function stockSummary(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $totalStock = Medicine::where('admin_id', $adminId)->sum('stock');
        $totalValue = Medicine::where('admin_id', $adminId)
            ->selectRaw('SUM(stock * purchase_price) as total')
            ->value('total') ?? 0;

        return response()->json([
            'total_stock' => $totalStock,
            'total_value' => $totalValue,
            'low_stock_count' => Medicine::where('admin_id', $adminId)
                ->where('stock', '<=', 5)
                ->where('stock', '>', 0)
                ->count(),
            'out_of_stock_count' => Medicine::where('admin_id', $adminId)
                ->where('stock', 0)
                ->count(),
        ]);
    }
}