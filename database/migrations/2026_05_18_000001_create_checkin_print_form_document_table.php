<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkin_print_form_document', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checkin_id')->constrained()->cascadeOnDelete();
            $table->foreignId('print_form_document_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_print_form_document');
    }
};
