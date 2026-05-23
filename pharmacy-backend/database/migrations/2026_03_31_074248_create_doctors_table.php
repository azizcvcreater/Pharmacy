<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('fees', 10, 2)->default(0)->change();
            $table->decimal('sonography_fee', 10, 2)->nullable()->after('fees');
            $table->decimal('ecg_fee', 10, 2)->nullable()->after('sonography_fee');
            $table->decimal('xray_fee', 10, 2)->nullable()->after('ecg_fee');
            $table->text('description')->nullable()->after('xray_fee');
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn(['sonography_fee', 'ecg_fee', 'xray_fee', 'description']);
        });
    }
};
