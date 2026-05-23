<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Strict rule: every domain table must include pharmacy_id.
        // These tables were missing it initially.
        Schema::table('purchase_details', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['pharmacy_id', 'purchase_id']);
        });

        Schema::table('sale_details', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['pharmacy_id', 'sale_id']);
        });

        Schema::table('staff_permissions', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['pharmacy_id', 'staff_id']);
        });

        // Helpful for strict isolation of API tokens (Super bypass is enforced in code).
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->index(['pharmacy_id', 'tokenable_type', 'tokenable_id'], 'pat_pharmacy_tokenable_idx');
        });

        // Backfill pharmacy_id where possible.
        // purchase_details -> purchases
        DB::table('purchase_details')
            ->join('purchases', 'purchase_details.purchase_id', '=', 'purchases.id')
            ->whereNull('purchase_details.pharmacy_id')
            ->update(['purchase_details.pharmacy_id' => DB::raw('purchases.pharmacy_id')]);

        // sale_details -> sales
        DB::table('sale_details')
            ->join('sales', 'sale_details.sale_id', '=', 'sales.id')
            ->whereNull('sale_details.pharmacy_id')
            ->update(['sale_details.pharmacy_id' => DB::raw('sales.pharmacy_id')]);

        // staff_permissions -> users (staff)
        DB::table('staff_permissions')
            ->join('users', 'staff_permissions.staff_id', '=', 'users.id')
            ->whereNull('staff_permissions.pharmacy_id')
            ->update(['staff_permissions.pharmacy_id' => DB::raw('users.pharmacy_id')]);

        // personal_access_tokens -> users (tokenable)
        DB::table('personal_access_tokens')
            ->join('users', function ($join) {
                $join->on('personal_access_tokens.tokenable_id', '=', 'users.id')
                    ->where('personal_access_tokens.tokenable_type', '=', 'App\\\\Models\\\\User');
            })
            ->whereNull('personal_access_tokens.pharmacy_id')
            ->update(['personal_access_tokens.pharmacy_id' => DB::raw('users.pharmacy_id')]);

        // Enforce NOT NULL where the data can be safely backfilled.
        Schema::table('purchase_details', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable(false)->change();
        });
        Schema::table('sale_details', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable(false)->change();
        });
        Schema::table('staff_permissions', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable(false)->change();
        });
        // personal_access_tokens may include tokens created before pharmacy_id existed; keep nullable.

        // Audit fields for critical tables.
        $auditTables = [
            'suppliers',
            'purchases',
            'purchase_details',
            'sales',
            'sale_details',
            'medicines',
            'medicine_items',
            'payments',
            'ledgers',
            'expenses',
            'doctors',
        ];

        foreach ($auditTables as $name) {
            Schema::table($name, function (Blueprint $table) use ($name) {
                if (!Schema::hasColumn($name, 'created_by')) {
                    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                }
                if (!Schema::hasColumn($name, 'updated_by')) {
                    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        // Reverse audit fields
        $auditTables = [
            'suppliers',
            'purchases',
            'purchase_details',
            'sales',
            'sale_details',
            'medicines',
            'medicine_items',
            'payments',
            'ledgers',
            'expenses',
            'doctors',
        ];

        foreach ($auditTables as $name) {
            Schema::table($name, function (Blueprint $table) use ($name) {
                if (Schema::hasColumn($name, 'created_by')) {
                    $table->dropConstrainedForeignId('created_by');
                }
                if (Schema::hasColumn($name, 'updated_by')) {
                    $table->dropConstrainedForeignId('updated_by');
                }
            });
        }

        // Reverse pharmacy_id additions
        Schema::table('purchase_details', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pharmacy_id');
        });
        Schema::table('sale_details', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pharmacy_id');
        });
        Schema::table('staff_permissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pharmacy_id');
        });
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pharmacy_id');
        });
    }
};

