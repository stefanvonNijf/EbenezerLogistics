<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->string('type')->nullable();
            $table->string('image_path')->nullable();
            $table->string('roletype')->default('shared');
            $table->integer('amount_in_stock')->default(0);
            $table->decimal('replacement_cost', 8, 2)->nullable();
            $table->unsignedInteger('minimal_stock')->nullable();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
