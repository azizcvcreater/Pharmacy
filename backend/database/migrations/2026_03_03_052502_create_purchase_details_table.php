<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
   Schema::create('purchase_details', function (Blueprint $table) {

    $table->id();
    $table->foreignId('purchase_id')->constrained()->onDelete('cascade');

    $table->integer('quantity');

        $table->string('generic');
        $table->string('brand');
        $table->string('dosage');
        $table->string('strength');
        $table->string('route');

    $table->decimal('buy_price',10,2);
    $table->decimal('sale_price',10,2);

    $table->decimal('total_buyer_price',10,2)->default(0);

    $table->decimal('profit_per_unit',10,2)->default(0);
    $table->decimal('total_profit',10,2)->default(0);

    $table->date('expiry_date')->nullable();

    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_details');
    }
};
