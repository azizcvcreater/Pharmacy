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
        Schema::create('medicine_items', function (Blueprint $table) {
        $table->id();
        $table->string('generic');
        $table->string('brand');
        $table->string('dosage');
        $table->string('strength');
        $table->string('route');
        $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_items');
    }
};
