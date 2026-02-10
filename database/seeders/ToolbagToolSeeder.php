<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ToolbagToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $toolbags = DB::table('toolbags')->get();
        $tools = DB::table('tools')->get();

        $pivotData = [];

        foreach ($toolbags as $bag) {
            foreach ($tools as $tool) {
                // Link shared tools and tools of the same roletype
                if ($tool->roletype === 'shared' || $tool->roletype === $bag->type) {
                    $pivotData[] = [
                        'toolbag_id' => $bag->id,
                        'tool_id' => $tool->id,
                        'amount_in_bag' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        DB::table('toolbag_tools')->insert($pivotData);
    }
}
