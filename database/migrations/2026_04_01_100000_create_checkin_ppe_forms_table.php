<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkin_ppe_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkin_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('checkins', function (Blueprint $table) {
            $table->dropColumn('ppe_form_exported_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_ppe_forms');

        Schema::table('checkins', function (Blueprint $table) {
            $table->timestamp('ppe_form_exported_at')->nullable()->after('contract_exported_at');
        });
    }
};
