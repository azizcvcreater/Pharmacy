<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStaffPermissionsTable extends Migration
{
    public function up()
    {
        Schema::create('staff_permissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('staff_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->boolean('can_edit_delete')->default(false);

            $table->foreignId('updated_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('staff_permissions');
    }
}
