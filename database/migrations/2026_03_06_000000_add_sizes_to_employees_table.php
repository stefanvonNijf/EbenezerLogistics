<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('shoe_size')->nullable()->after('remark');
            $table->string('pants_size')->nullable()->after('shoe_size');
            $table->string('jacket_size')->nullable()->after('pants_size');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['shoe_size', 'pants_size', 'jacket_size']);
        });
    }
};
