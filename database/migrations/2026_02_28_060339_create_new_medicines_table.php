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
        Schema::create('new_medicines', function (Blueprint $table) {
            $table->id();
            $table->string('main_name');
            $table->string('business_name');
            $table->string('description');
            $table->foreignId('medicine_family_id')->constrained('medicine_families')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('new_medicines');
    }
};
