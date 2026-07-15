<?php
// app/Http/Controllers/Api/ExpenseController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $perPage = $request->input('limit', 10);
        $search = $request->input('search');
        $category = $request->input('category');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = Expense::with('medicine')
            ->where('admin_id', $adminId);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('medicine', function($sq) use ($search) {
                      $sq->where('generic', 'LIKE', "%{$search}%")
                        ->orWhere('brand', 'LIKE', "%{$search}%");
                  });
            });
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($fromDate) {
            $query->whereDate('expense_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('expense_date', '<=', $toDate);
        }

        $expenses = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $expenses->items(),
            'total' => $expenses->total(),
            'current_page' => $expenses->currentPage(),
            'last_page' => $expenses->lastPage(),
            'per_page' => $expenses->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'category' => 'required|in:purchase,utility,rent,salary,maintenance,other',
            'description' => 'nullable|string|max:500',
            'medicine_id' => 'nullable|exists:medicines,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense = Expense::create([
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'category' => $request->category,
            'description' => $request->description,
            'medicine_id' => $request->medicine_id,
            'admin_id' => $adminId,
        ]);

        return response()->json($expense->load('medicine'), 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $expense = Expense::with('medicine')
            ->where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        return response()->json($expense);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $expense = Expense::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'sometimes|numeric|min:0.01',
            'expense_date' => 'sometimes|date',
            'category' => 'sometimes|in:purchase,utility,rent,salary,maintenance,other',
            'description' => 'nullable|string|max:500',
            'medicine_id' => 'nullable|exists:medicines,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $expense->update($request->only([
            'amount', 'expense_date', 'category', 'description', 'medicine_id'
        ]));

        return response()->json($expense->load('medicine'));
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $adminId = $user->isAdmin() ? $user->id : $user->admin_id;

        $expense = Expense::where('id', $id)
            ->where('admin_id', $adminId)
            ->first();

        if (!$expense) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully']);
    }
}