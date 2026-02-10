<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electricians = [
            ['name' => 'Hélcio Alves', 'role' => 'electrician'],
            ['name' => 'Joaquim Alexandre', 'role' => 'electrician'],
            ['name' => 'Rui Castanheira', 'role' => 'electrician'],
            ['name' => 'João Couto', 'role' => 'electrician'],
            ['name' => 'João Catarino', 'role' => 'electrician'],
            ['name' => 'Idloy Domingos', 'role' => 'electrician'],
            ['name' => 'Catalin Doina', 'role' => 'electrician'],
            ['name' => 'José Dias', 'role' => 'electrician'],
            ['name' => 'Nuno Dias', 'role' => 'electrician'],
            ['name' => 'Vitor Esteves', 'role' => 'electrician'],
            ['name' => 'Afonso Fernandes', 'role' => 'electrician'],
            ['name' => 'Carlos Ferreira', 'role' => 'electrician'],
            ['name' => 'João Ferreira', 'role' => 'electrician'],
            ['name' => 'Henrique Fernandes', 'role' => 'electrician'],
            ['name' => 'Armando Franco', 'role' => 'electrician'],
            ['name' => 'Carlos Guerreiro', 'role' => 'electrician'],
            ['name' => 'Mário Vinhas', 'role' => 'electrician'],
            ['name' => 'Bodhan Hreshcuk', 'role' => 'electrician'],
            ['name' => 'Sergey Haminskiy', 'role' => 'electrician'],
            ['name' => 'Ricardo Matos', 'role' => 'electrician'],
            ['name' => 'Tiago Marques', 'role' => 'electrician'],
            ['name' => 'Ivo Miranda', 'role' => 'electrician'],
            ['name' => 'Ruben Marques', 'role' => 'electrician'],
            ['name' => 'José Fialho Martins', 'role' => 'electrician'],
            ['name' => 'João Marques', 'role' => 'electrician'],
            ['name' => 'Miguel Nóbrega', 'role' => 'electrician'],
            ['name' => 'Flávio Neves', 'role' => 'electrician'],
            ['name' => 'Cláudio Pereira', 'role' => 'electrician'],
            ['name' => 'Sérgio Rodrigues', 'role' => 'electrician'],
            ['name' => 'Valentyn Rylan', 'role' => 'electrician'],
            ['name' => 'Carlos Sousa', 'role' => 'electrician'],
            ['name' => 'Simão Tavares', 'role' => 'electrician'],
            ['name' => 'Gregório Teixeira', 'role' => 'electrician'],
            ['name' => 'Fernando Tavares', 'role' => 'electrician'],
            ['name' => 'Tomasz Wisnieweski', 'role' => 'electrician'],
            ['name' => 'Paulo Santos', 'role' => 'electrician'],
            ['name' => 'Óscar Silva', 'role' => 'electrician'],
            ['name' => 'Gustavo Costa', 'role' => 'electrician'],
            ['name' => 'Rui Santos', 'role' => 'electrician'],
            ['name' => 'Rui Quendera', 'role' => 'electrician'],
            ['name' => 'Pedro Sabino', 'role' => 'electrician'],
            ['name' => 'César Prata', 'role' => 'electrician'],
            ['name' => 'Manuel Ribeiro', 'role' => 'electrician'],
        ];

        $ironworkers = [
            ['name' => 'Vitor Andrade', 'role' => 'ironworker'],
            ['name' => 'Telmo Andrade', 'role' => 'ironworker'],
            ['name' => 'Vladyslav Brykalov', 'role' => 'ironworker'],
            ['name' => 'Vitor Lara Jimeno', 'role' => 'ironworker'],
            ['name' => 'Filipe Marabuto', 'role' => 'ironworker'],
            ['name' => 'Dawid Olbrich', 'role' => 'ironworker'],
            ['name' => 'Helder Pinto', 'role' => 'ironworker'],
            ['name' => 'Paulo Silvestre', 'role' => 'ironworker'],
            ['name' => 'André Teixeira', 'role' => 'ironworker'],
            ['name' => 'Sérgio Dias', 'role' => 'ironworker'],
            ['name' => 'Paulo Nunes', 'role' => 'ironworker'],
            ['name' => 'Flávio Barreto', 'role' => 'ironworker'],
            ['name' => 'José Chaminé', 'role' => 'ironworker'],
        ];

        $employees = array_merge($electricians, $ironworkers);
        DB::table('employees')->insert($employees);
    }
}
