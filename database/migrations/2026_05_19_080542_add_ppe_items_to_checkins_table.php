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
        Schema::table('checkins', function (Blueprint $table) {
            $table->json('ppe_items')->nullable()->after('custom_items');
        });
    }

    public function down(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->dropColumn('ppe_items');
        });
    }
};
