<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Employee;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Ebenezer',
            'email' => 'ebenezer@es-h.com',
            'password' => Hash::make('ebenezer'),
        ]);

        //Categories
        $categories = [
            'Screwdrivers',
            'Pliers',
            'Sets',
            'Other'
        ];
        foreach ($categories as $category) {
            Category::factory()->create(['name' => $category]);
        }

        // Tools per category
        $screwdrivers = [
            'Facom insulated screwdriver',
            'Facom insulated screwdriver',
            'Facom insulated screwdriver',
            'Facom insulated screwdriver',
            'Facom insulated screwdriver',
            'Facom phillips screwdriver',
            'Facom phillips screwdriver',
            'Facom phillips screwdriver',
            'Carolus voltage-tester screwdriver',
            'Facom small phillips screwdriver',
            'Facom small phillips screwdriver',
            'Facom small flathead screwdriver',
            'Facom small flathead screwdriver',
            'Facom small flathead screwdriver',
        ];

        $pliers = [
            'Knipex universal pliers',
            'Knipex cutting pliers',
            'Knipex electronic cutting pliers',
            'Knipex curved nose pliers',
            'Knipex self-adjusting crimping pliers',
            'Knipex terminal crimping pliers',
            'Knipex wire stripping pliers',
            'Knipex special wire stripping pliers',
            'Facom clamp pliers',
        ];

        $sets = [
            'Facom toolcase',
            'Stanley tool backpack',
            'Drill Bit Set 1–13mm',
            'Metabo bit set',
        ];

        $others = [
            'Facom Hammer',
            'Promat Level',
            'Punch',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Combination Wrench',
            'Facom Hex Key 10mm',
            'Facom Hex Key 8mm',
            'Facom Hex Key 6mm',
            'Facom Hex Key 5mm',
            'Facom Hex Key 4mm',
            'Facom Hex Key 3mm',
            'Facom Hex Key 2.5mm',
            'Facom Hex Key 2mm',
            'Facom Hex Key 1.5mm',
            'Promat Socket 6mm',
            'Promat Socket 7mm',
            'Promat Socket 8mm',
            'Promat Socket 9mm',
            'Promat Socket 10mm',
            'Promat Socket 11mm',
            'Promat Socket 12mm',
            'Promat Socket 13mm',
            'Promat Socket 15mm',
            'Promat Socket 17mm',
            'Promat Socket 19mm',
            'Promat Socket 22mm',
            'Promat Socket 24mm',
            'Promat Ratchet 3/8"',
            'Promat Small Extension',
            'Promat Large Extension',
            'Promat Universal Joint',
            'Promat Ratchet',
            'Adjustable Wrench Bahco Special 8"',
            'Adjustable Wrench Bahco 6"',
            'Facom large hand saw',
            'Bahco small hand saw',
            'Promat square',
            'Carolus large file',
            'Carolus flat file',
            'Gedore long extension',
            'Gedore Bit Holder Handle',
            'Number Punches 3',
            'Number Punches 4',
            'Number Punches 5',
            'Digi-Tool Digital Multimeter',
            'Mitutoyo caliper',
        ];

        $categories = Category::all()->keyBy('name');

        // Helper-functie om merk & type te splitsen
        $createTools = function (array $tools, string $category) use ($categories) {
            foreach ($tools as $cleanName) {

                // Eerste woord = merk
                $parts = explode(' ', $cleanName, 2);
                $brand = $parts[0] ?? '';
                $type = $parts[1] ?? '';

                // Beschrijving opbouwen
                $description = "Brand: {$brand}";
                if ($type) {
                    $description .= ", Type: {$type}";
                }

                Tool::factory()->create([
                    'name' => $cleanName,
                    'description' => $description,
                    'category_id' => $categories[$category]->id,
                ]);
            }
        };

        $createTools($screwdrivers, 'Screwdrivers');
        $createTools($pliers, 'Pliers');
        $createTools($sets, 'Sets');
        $createTools($others, 'Other');
    }
}
