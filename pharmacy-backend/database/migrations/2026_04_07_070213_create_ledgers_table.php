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
        Schema::create('ledgers', function (Blueprint $table) {
        $table->id();
        $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
    

        $table->string('type'); // purchase / payment
        $table->decimal('amount', 10, 2); // + or -

        $table->unsignedBigInteger('reference_id')->nullable();
        $table->string('reference_type')->nullable();

        $table->decimal('balance', 10, 2); // running balance
        $table->date('transaction_date');

        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledgers');
    }
};
