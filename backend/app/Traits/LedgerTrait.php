<?php
namespace App\Traits;

use App\Models\Ledger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait LedgerTrait
{
    protected function updateLedger($supplierId, $type, $amount, $reference, $transactionDate)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::warning('Ledger: no authenticated user');
                return;
            }
            $pharmacyId = $user->pharmacy_id;

            $lastLedger = Ledger::where('supplier_id', $supplierId)
                ->where('pharmacy_id', $pharmacyId)
                ->orderBy('transaction_date', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->last();

            $previousBalance = $lastLedger ? $lastLedger->balance : 0;
            $newBalance = ($type === 'purchase') ? $previousBalance + $amount : $previousBalance - $amount;

            Ledger::create([
                'supplier_id'      => $supplierId,
                'pharmacy_id'      => $pharmacyId,
                'type'             => $type,
                'amount'           => $amount,
                'reference_id'     => $reference->id,
                'reference_type'   => get_class($reference),
                'balance'          => $newBalance,
                'transaction_date' => $transactionDate,
            ]);
        } catch (\Exception $e) {
            Log::error('Ledger creation failed: ' . $e->getMessage());
        }
    }

    protected function deleteLedgerEntries($reference)
    {
        try {
            Ledger::where('reference_id', $reference->id)
                ->where('reference_type', get_class($reference))
                ->delete();
        } catch (\Exception $e) {
            Log::error('Ledger deletion failed: ' . $e->getMessage());
        }
    }
}
