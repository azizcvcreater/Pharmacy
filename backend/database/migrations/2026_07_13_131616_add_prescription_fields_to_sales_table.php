<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->enum('sale_type', ['prescription', 'non_prescription'])->default('non_prescription')->after('sale_date');
            $table->string('prescription_number')->nullable()->after('sale_type');
            $table->string('doctor_name')->nullable()->after('prescription_number');
            $table->string('patient_name')->nullable()->after('doctor_name');
            $table->string('patient_phone')->nullable()->after('patient_name');
            $table->text('prescription_image')->nullable()->after('patient_phone');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'sale_type',
                'prescription_number',
                'doctor_name',
                'patient_name',
                'patient_phone',
                'prescription_image'
            ]);
        });
    }
};