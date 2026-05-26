<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('license_plate')->unique();
            $table->unsignedInteger('mileage')->nullable();
            $table->foreignId('employee_id')
                ->nullable()
                ->unique()
                ->constrained('employees')
                ->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('car_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained('cars')->cascadeOnDelete();
            $table->string('path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_photos');
        Schema::dropIfExists('cars');
    }
};
