<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('role')->change();
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->string('roletype')->default('shared')->change();
        });

        Schema::table('toolbags', function (Blueprint $table) {
            $table->string('type')->change();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->enum('role', ['ironworker', 'electrician'])->change();
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->enum('roletype', ['shared', 'ironworker', 'electrician'])->default('shared')->change();
        });

        Schema::table('toolbags', function (Blueprint $table) {
            $table->enum('type', ['ironworker', 'electrician'])->change();
        });
    }
};
