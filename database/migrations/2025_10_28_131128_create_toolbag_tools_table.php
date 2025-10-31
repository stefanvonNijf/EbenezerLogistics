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
        Schema::create('toolbag_tools', function (Blueprint $table) {
            $table->foreignId('toolbag_id')
                ->constrained('toolbags')
                ->onDelete('cascade');
            $table->foreignId('tool_id')
                ->constrained('tools')
                ->onDelete('cascade');
            $table->integer('amount_in_bag')->default(1);
            $table->primary(['toolbag_id', 'tool_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toolbag_tools');
    }
};
