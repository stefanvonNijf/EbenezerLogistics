<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change employees.role from enum to string
        DB::statement("ALTER TABLE employees MODIFY COLUMN `role` VARCHAR(255) NOT NULL");

        // Change tools.roletype from enum to string
        DB::statement("ALTER TABLE tools MODIFY COLUMN `roletype` VARCHAR(255) NOT NULL DEFAULT 'shared'");

        // Change toolbags.type from enum to string
        DB::statement("ALTER TABLE toolbags MODIFY COLUMN `type` VARCHAR(255) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE employees MODIFY COLUMN `role` ENUM('ironworker', 'electrician') NOT NULL");
        DB::statement("ALTER TABLE tools MODIFY COLUMN `roletype` ENUM('shared', 'ironworker', 'electrician') NOT NULL DEFAULT 'shared'");
        DB::statement("ALTER TABLE toolbags MODIFY COLUMN `type` ENUM('ironworker', 'electrician') NOT NULL");
    }
};
