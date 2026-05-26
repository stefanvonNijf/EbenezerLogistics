<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pbm_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('pbm_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('pbm_category_id')->nullable()->constrained('pbm_categories')->nullOnDelete();
            $table->string('size')->nullable();
            $table->unsignedInteger('amount_in_stock')->default(0);
            $table->unsignedInteger('minimal_stock')->nullable();
            $table->decimal('replacement_cost', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pbm_items');
        Schema::dropIfExists('pbm_categories');
    }
};
