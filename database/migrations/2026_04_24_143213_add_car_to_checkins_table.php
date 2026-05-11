<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->foreignId('car_id')->nullable()->constrained('cars')->nullOnDelete();
            $table->unsignedInteger('checkin_mileage')->nullable();
            $table->unsignedInteger('checkout_mileage')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->dropForeign(['car_id']);
            $table->dropColumn(['car_id', 'checkin_mileage', 'checkout_mileage']);
        });
    }
};
