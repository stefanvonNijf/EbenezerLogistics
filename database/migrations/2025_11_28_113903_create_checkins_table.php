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
            $table->json('custom_items')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkins');
    }
};
