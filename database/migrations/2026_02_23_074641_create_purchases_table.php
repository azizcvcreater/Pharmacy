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
        
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->date('Date')->useCurrent();
            $table->string('bill_no');
            $table->string('company');
            $table->string('name');
            $table->string('type');
            $table->integer('quantity');
            $table->decimal('unit_price',10,2);
            $table->decimal('total_price');
            $table->decimal('cash', 10, 2);
            $table->decimal('credit', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
