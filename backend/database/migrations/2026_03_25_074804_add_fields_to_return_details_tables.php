<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchase_return_details', function (Blueprint $table) {
            $table->integer('quantity')->default(0)->change();
            $table->string('name')->nullable();
            $table->string('generic_name')->nullable();
            $table->string('company')->nullable();
            $table->string('family')->nullable();
        });

        Schema::table('sale_return_details', function (Blueprint $table) {
            $table->integer('quantity')->default(0)->change();
            $table->string('name')->nullable();
            $table->string('generic_name')->nullable();
            $table->string('company')->nullable();
            $table->string('family')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('purchase_return_details', function (Blueprint $table) {
            $table->dropColumn(['generic_name', 'company', 'family']);
        });

        Schema::table('sale_return_details', function (Blueprint $table) {
            $table->dropColumn(['generic_name', 'company', 'family']);
        });
    }
};
