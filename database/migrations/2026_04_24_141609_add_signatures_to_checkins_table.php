<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->text('employee_checkin_signature')->nullable();
            $table->text('manager_checkin_signature')->nullable();
            $table->text('employee_checkout_signature')->nullable();
            $table->text('manager_checkout_signature')->nullable();
            $table->string('signed_checkin_pdf_path')->nullable();
            $table->string('signed_checkout_pdf_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->dropColumn([
                'employee_checkin_signature',
                'manager_checkin_signature',
                'employee_checkout_signature',
                'manager_checkout_signature',
                'signed_checkin_pdf_path',
                'signed_checkout_pdf_path',
            ]);
        });
    }
};
