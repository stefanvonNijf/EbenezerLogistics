<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cars = [
            ['brand' => 'Kia Picanto', 'license_plate' => 'P435TD' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'P439TD' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'P440TD' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'P441TD' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'R731SR' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'R733SR' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'R735SR' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'R737SR' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X235FF' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X272FF' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X273FF' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X299FF' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X300FF' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X326GH' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X327GH' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X328GH' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X329GH' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X336GH' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X416GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X417GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X418GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X419GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X428GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X429GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X430GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X431GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'X432GV' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'Z127DP' ],
            ['brand' => 'Kia Picanto', 'license_plate' => 'Z680FT' ],
            ['brand' => 'Opel Vivaro', 'license_plate' => 'V53JZB' ],
            ['brand' => 'Opel Vivaro', 'license_plate' => 'V54JZB' ],
        ];

        DB::table('cars')->insert($cars);
    }
}
