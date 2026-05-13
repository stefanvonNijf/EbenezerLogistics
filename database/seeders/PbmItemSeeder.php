<?php

namespace Database\Seeders;

use App\Models\PbmCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PbmItemSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = PbmCategory::where('name', 'PPE')->value('id');

        $items = [
            ['name' => 'Pants',            'sizes' => range(42, 66, 2)],
            ['name' => 'Jackets',          'sizes' => range(42, 62, 2)],
            ['name' => 'Boots',            'sizes' => range(38, 46, 1)],
            ['name' => 'Coveralls blue',   'sizes' => range(42, 62, 2)],
            ['name' => 'Coveralls orange', 'sizes' => range(42, 62, 2)],
            ['name' => 'Warming vests',    'sizes' => range(42, 62, 2)],
            ["name" => "Parka's blue",     'sizes' => range(42, 62, 2)],
            ["name" => "Parka's yellow",   'sizes' => range(42, 62, 2)],
            ['name' => 'Rain trousers',    'sizes' => range(42, 66, 2)],
            ['name' => 'Rain jackets',     'sizes' => range(42, 62, 2)],
        ];

        $rows = [];
        $now  = now();

        foreach ($items as $item) {
            foreach ($item['sizes'] as $size) {
                $rows[] = [
                    'name'             => $item['name'],
                    'pbm_category_id'  => $categoryId,
                    'size'             => (string) $size,
                    'amount_in_stock'  => 2,
                    'minimal_stock'    => 2,
                    'replacement_cost' => 0,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];
            }
        }

        DB::table('pbm_items')->insert($rows);
    }
}
