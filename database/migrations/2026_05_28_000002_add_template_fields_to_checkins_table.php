<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->boolean('is_template')->default(false)->after('is_ppe');
            $table->foreignId('toolbox_template_id')->nullable()->after('is_template')
                ->constrained('toolbox_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('checkins', function (Blueprint $table) {
            $table->dropForeign(['toolbox_template_id']);
            $table->dropColumn(['is_template', 'toolbox_template_id']);
        });
    }
};
