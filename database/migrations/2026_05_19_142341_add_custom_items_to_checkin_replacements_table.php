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
        Schema::table('checkin_replacements', function (Blueprint $table) {
            $table->json('custom_items')->nullable()->after('replaced_tools');
        });
    }

    public function down(): void
    {
        Schema::table('checkin_replacements', function (Blueprint $table) {
            $table->dropColumn('custom_items');
        });
    }
};
