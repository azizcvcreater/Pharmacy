<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SupplierPaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProfitController;
use App\Http\Controllers\Api\SalePaymentController; // <-- ADD THIS LINE

// REGISTER
Route::post('/register', [AuthController::class, 'register']);

// LOGIN
Route::post('/login', [AuthController::class, 'login']);

// PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    // Medicines
    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::post('/medicines', [MedicineController::class, 'store']);
    Route::get('/medicines/{id}', [MedicineController::class, 'show']);
    Route::put('/medicines/{id}', [MedicineController::class, 'update']);
    Route::delete('/medicines/{id}', [MedicineController::class, 'destroy']);
    Route::get('/medicines/stock-summary', [MedicineController::class, 'stockSummary']);

    // Suppliers
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
    Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

    // Purchases
    Route::get('/purchases', [PurchaseController::class, 'index']);
    Route::post('/purchases', [PurchaseController::class, 'store']);
    Route::get('/purchases/{id}', [PurchaseController::class, 'show']);
    Route::put('/purchases/{id}', [PurchaseController::class, 'update']);
    Route::delete('/purchases/{id}', [PurchaseController::class, 'destroy']);
    Route::post('/purchases/{id}/pay', [PurchaseController::class, 'applyPayment']);

    // Sales
    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
    Route::delete('/sales/{id}', [SaleController::class, 'destroy']);

    // Sale Payments
    Route::get('/sale-payments', [SalePaymentController::class, 'index']);
    Route::post('/sale-payments', [SalePaymentController::class, 'store']);
    Route::get('/sale-payments/{id}', [SalePaymentController::class, 'show']);
    Route::delete('/sale-payments/{id}', [SalePaymentController::class, 'destroy']);

    // Supplier Payments
    Route::get('/supplier-payments', [SupplierPaymentController::class, 'index']);
    Route::post('/supplier-payments', [SupplierPaymentController::class, 'store']);
    Route::get('/supplier-payments/{id}', [SupplierPaymentController::class, 'show']);
    Route::put('/supplier-payments/{id}', [SupplierPaymentController::class, 'update']);
    Route::delete('/supplier-payments/{id}', [SupplierPaymentController::class, 'destroy']);
    Route::get('/supplier-payments/summary/{supplierId}', [SupplierPaymentController::class, 'summary']);

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

    // Profit & Reports
    Route::get('/profit/summary', [ProfitController::class, 'summary']);
    Route::get('/profit/report', [ProfitController::class, 'report']);

    // ADMIN ONLY ROUTES
    Route::middleware('role:admin')->group(function () {
        Route::post('/create-staff', [AuthController::class, 'createStaff']);
        Route::get('/users', [AuthController::class, 'getUsers']);
        Route::put('/users/{id}', [AuthController::class, 'updateUser']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    });
});