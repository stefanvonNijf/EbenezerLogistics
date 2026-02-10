<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ToolbagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ironworkerToolbags = [
            ['name' => 'ESB 50', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 51', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 57', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 58', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 59', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 60', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 61', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 62', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 64', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 65', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 83', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 84', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 85', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 89', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 91', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 92', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 93', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 97', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 103', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 104', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 118', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 119', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 121', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 122', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 124', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 125', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 126', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 127', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 128', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 131', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 132', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 133', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 134', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 137', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 145', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 147', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 148', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 149', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 150', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
            ['name' => 'ESB 151', 'notes' => null, 'type' => 'ironworker', 'complete' => false],
            ['name' => 'ESB 152', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
//            ['name' => 'ESB ', 'notes' => null, 'type' => 'ironworker', 'complete' => true],
        ];

        $electricianToolbags = [
            ['name' => 'ESB 01', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 07', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 13', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 27', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 31', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 33', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 35', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 37', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 39', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 40', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 46', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 47', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 48', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 49', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 54', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 63', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 66', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 70', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 76', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 79', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 80', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 81', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 82', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 90', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 108', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 110', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 111', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 155', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 157', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 160', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 163', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 164', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 166', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 167', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 169', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 170', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 171', 'notes' => null, 'type' => 'electrician', 'complete' => true],
            ['name' => 'ESB 10', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 77', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 168', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 55', 'notes' => null, 'type' => 'electrician', 'complete' => false],
            ['name' => 'ESB 12', 'notes' => null, 'type' => 'electrician', 'complete' => false],
//            ['name' => 'ESB ', 'notes' => null, 'type' => 'electrician', 'complete' => false],
        ];

        $toolbags = array_merge($ironworkerToolbags, $electricianToolbags);
        DB::table('toolbags')->insert($toolbags);
    }
}
