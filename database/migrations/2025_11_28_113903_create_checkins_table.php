<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkins', function (Blueprint $table) {
            $table->id();
            $table->date('checkin_date');
            $table->date('checkout_date')->nullable();
            $table->date('planned_checkout_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('planned_checkin');
            $table->timestamp('contract_exported_at')->nullable();
            $table->json('missing_tools')->nullable();
            $table->json('notification_emails')->nullable();
            $table->foreignId('employee_id')->constrained('employees');
            $table->foreignId('toolbag_id')->nullable()->constrained('toolbags');
            $table->foreignId('car_id')->nullable()->constrained('cars')->nullOnDelete();
            $table->unsignedInteger('checkin_mileage')->nullable();
            $table->unsignedInteger('checkout_mileage')->nullable();
            $table->json('custom_items')->nullable();
            $table->json('ppe_items')->nullable();
            $table->boolean('is_ppe')->default(false);
            $table->text('employee_checkin_signature')->nullable();
            $table->text('manager_checkin_signature')->nullable();
            $table->text('employee_checkout_signature')->nullable();
            $table->text('manager_checkout_signature')->nullable();
            $table->string('signed_checkin_pdf_path')->nullable();
            $table->string('signed_checkout_pdf_path')->nullable();
            $table->timestamps();
        });

        Schema::create('checkin_ppe_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkin_id')->constrained('checkins')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('checkin_replacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkin_id')->constrained('checkins')->cascadeOnDelete();
            $table->json('replaced_tools');
            $table->json('custom_items')->nullable();
            $table->text('employee_signature')->nullable();
            $table->text('manager_signature')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_replacements');
        Schema::dropIfExists('checkin_ppe_forms');
        Schema::dropIfExists('checkins');
    }
};
