<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employee_number')->unique()->nullable();
            $table->text('remark')->nullable();
            $table->string('role');
            $table->string('shoe_size')->nullable();
            $table->string('pants_size')->nullable();
            $table->string('jacket_size')->nullable();
            $table->string('coverall_size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
