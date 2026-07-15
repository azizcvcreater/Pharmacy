<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('limit', 5);
        $search = $request->input('search');
        $user = $request->user();
        
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;
        
        $query = Supplier::where('admin_id', $adminId);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }
        
        $suppliers = $query->latest()->paginate($perPage);
        
        return response()->json([
            'data' => $suppliers->items(),
            'total' => $suppliers->total(),
            'current_page' => $suppliers->currentPage(),
            'last_page' => $suppliers->lastPage(),
            'per_page' => $suppliers->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $supplier = Supplier::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
            'admin_id' => $adminId,
        ]);

        return response()->json($supplier, 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $supplier = Supplier::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $supplier = Supplier::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $supplier->update($request->only([
            'name', 'phone', 'address'
        ]));

        return response()->json($supplier);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $supplier = Supplier::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$supplier) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }

        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}