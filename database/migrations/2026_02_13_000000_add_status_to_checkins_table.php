<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->string('status')->default('planned_checkin')->after('notes');
        });

        // Make toolbag_id nullable
        Schema::table('checkins', function (Blueprint $table) {
            $table->unsignedBigInteger('toolbag_id')->nullable()->change();
        });

        // Backfill existing rows
        DB::table('checkins')->whereNotNull('checkout_date')->update(['status' => 'checked_out']);
        DB::table('checkins')->whereNull('checkout_date')->whereNotNull('toolbag_id')->update(['status' => 'planned_checkout']);
    }

    public function down(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('checkins', function (Blueprint $table) {
            $table->unsignedBigInteger('toolbag_id')->nullable(false)->change();
        });
    }
};
