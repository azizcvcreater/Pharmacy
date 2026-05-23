<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('medicines', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });

    Schema::table('sales', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });

    Schema::table('purchases', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });

    Schema::table('medicine_items', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });

    Schema::table('expenses', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });

    Schema::table('doctors', function (Blueprint $table) {
        $table->foreignId('pharmacy_id')->nullable()->after('id')->constrained()->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
