<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insertOrIgnore([
            ['name' => 'electrician',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'electrician foreman', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'ironworker',          'created_at' => now(), 'updated_at' => now()],
            ['name' => 'ironworker foreman',  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'supervisor',          'created_at' => now(), 'updated_at' => now()],
            ['name' => 'technician',          'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
