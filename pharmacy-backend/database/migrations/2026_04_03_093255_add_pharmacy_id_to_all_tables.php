<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1️⃣ Users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
        });

        // 2️⃣ Purchases table
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });

        // 3️⃣ Sales table
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });

        // 4️⃣ Expenses table
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });

        // 5️⃣ Doctors table
        Schema::table('doctors', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });

        // 6️⃣ Medicines table
        Schema::table('medicines', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });

        // 7️⃣ Medicine Items table
        Schema::table('medicine_items', function (Blueprint $table) {
            $table->foreignId('pharmacy_id')->after('user_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        $tables = ['users', 'purchases', 'sales', 'expenses', 'doctors', 'medicines', 'medicine_items'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign([$tableName . '_pharmacy_id_foreign']);
                $table->dropColumn('pharmacy_id');
            });
        }
    }
};
