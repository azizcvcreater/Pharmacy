<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('sales', function (Blueprint $table) {

            $table->decimal('total_amount',10,2)->default(0)->after('sale_date');
            $table->decimal('paid_amount',10,2)->default(0)->after('total_amount');
            $table->decimal('due_amount',10,2)->default(0)->after('paid_amount');

            $table->enum('payment_status',['pending','partial','paid'])
                ->default('pending')
                ->after('due_amount');
        });
    }

    public function down()
    {
        Schema::table('sales', function (Blueprint $table) {

            $table->dropColumn([
                'total_amount',
                'paid_amount',
                'due_amount',
                'payment_status'
            ]);
        });
    }
};
