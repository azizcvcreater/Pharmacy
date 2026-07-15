<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->integer('stock')->default(0)->after('route');
            $table->decimal('purchase_price', 12, 2)->default(0)->after('stock');
            $table->decimal('selling_price', 12, 2)->default(0)->after('purchase_price');
        });
    }

    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn(['stock', 'purchase_price', 'selling_price']);
        });
    }
};