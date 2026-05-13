<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PbmCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['PPE', 'PBM'];

        foreach ($categories as $category) {
            DB::table('pbm_categories')->insert([
                'name'       => $category,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
