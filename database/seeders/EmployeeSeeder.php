<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $electricians = [
            ['name' => 'Hélcio Alves', 'employee_number' => '1', 'role' => 'electrician'],
            ['name' => 'Joaquim Alexandre', 'employee_number' => '2', 'role' => 'electrician'],
            ['name' => 'Rui Castanheira', 'employee_number' => '3', 'role' => 'electrician'],
            ['name' => 'João Couto', 'employee_number' => '4', 'role' => 'electrician'],
            ['name' => 'João Catarino', 'employee_number' => '5', 'role' => 'electrician'],
            ['name' => 'Idloy Domingos', 'employee_number' => '6', 'role' => 'electrician'],
            ['name' => 'Catalin Doina', 'employee_number' => '7', 'role' => 'electrician'],
            ['name' => 'José Dias', 'employee_number' => '8', 'role' => 'electrician'],
            ['name' => 'Nuno Dias', 'employee_number' => '9', 'role' => 'electrician'],
            ['name' => 'Vitor Esteves', 'employee_number' => '10', 'role' => 'electrician'],
            ['name' => 'Afonso Fernandes', 'employee_number' => '11', 'role' => 'electrician'],
            ['name' => 'Carlos Ferreira', 'employee_number' => '12', 'role' => 'electrician'],
            ['name' => 'João Ferreira', 'employee_number' => '13', 'role' => 'electrician'],
            ['name' => 'Henrique Fernandes', 'employee_number' => '14', 'role' => 'electrician'],
            ['name' => 'Armando Franco', 'employee_number' => '15', 'role' => 'electrician'],
            ['name' => 'Carlos Guerreiro', 'employee_number' => '16', 'role' => 'electrician'],
            ['name' => 'Mário Vinhas', 'employee_number' => '17', 'role' => 'electrician'],
            ['name' => 'Bodhan Hreshcuk', 'employee_number' => '18', 'role' => 'electrician'],
            ['name' => 'Sergey Haminskiy', 'employee_number' => '19', 'role' => 'electrician'],
            ['name' => 'Ricardo Matos', 'employee_number' => '20', 'role' => 'electrician'],
            ['name' => 'Tiago Marques', 'employee_number' => '21', 'role' => 'electrician'],
            ['name' => 'Ivo Miranda', 'employee_number' => '22', 'role' => 'electrician'],
            ['name' => 'Ruben Marques', 'employee_number' => '23', 'role' => 'electrician'],
            ['name' => 'José Fialho Martins', 'employee_number' => '24', 'role' => 'electrician'],
            ['name' => 'João Marques', 'employee_number' => '25', 'role' => 'electrician'],
            ['name' => 'Miguel Nóbrega', 'employee_number' => '26', 'role' => 'electrician'],
            ['name' => 'Flávio Neves', 'employee_number' => '27', 'role' => 'electrician'],
            ['name' => 'Cláudio Pereira', 'employee_number' => '28', 'role' => 'electrician'],
            ['name' => 'Sérgio Rodrigues', 'employee_number' => '29', 'role' => 'electrician'],
            ['name' => 'Valentyn Rylan', 'employee_number' => '30', 'role' => 'electrician'],
            ['name' => 'Carlos Sousa', 'employee_number' => '31', 'role' => 'electrician'],
            ['name' => 'Simão Tavares', 'employee_number' => '32', 'role' => 'electrician'],
            ['name' => 'Gregório Teixeira', 'employee_number' => '33', 'role' => 'electrician'],
            ['name' => 'Fernando Tavares', 'employee_number' => '34', 'role' => 'electrician'],
            ['name' => 'Tomasz Wisnieweski', 'employee_number' => '35', 'role' => 'electrician'],
            ['name' => 'Paulo Santos', 'employee_number' => '36', 'role' => 'electrician'],
            ['name' => 'Óscar Silva', 'employee_number' => '37', 'role' => 'electrician'],
            ['name' => 'Gustavo Costa', 'employee_number' => '38', 'role' => 'electrician'],
            ['name' => 'Rui Santos', 'employee_number' => '39', 'role' => 'electrician'],
            ['name' => 'Rui Quendera', 'employee_number' => '40', 'role' => 'electrician'],
            ['name' => 'Pedro Sabino', 'employee_number' => '41', 'role' => 'electrician'],
            ['name' => 'César Prata', 'employee_number' => '42', 'role' => 'electrician'],
            ['name' => 'Manuel Ribeiro', 'employee_number' => '43', 'role' => 'electrician'],
        ];

        $ironworkers = [
            ['name' => 'Vitor Andrade', 'employee_number' => '44', 'role' => 'ironworker'],
            ['name' => 'Telmo Andrade', 'employee_number' => '45', 'role' => 'ironworker'],
            ['name' => 'Vladyslav Brykalov', 'employee_number' => '46', 'role' => 'ironworker'],
            ['name' => 'Vitor Lara Jimeno', 'employee_number' => '47', 'role' => 'ironworker'],
            ['name' => 'Filipe Marabuto', 'employee_number' => '48', 'role' => 'ironworker'],
            ['name' => 'Dawid Olbrich', 'employee_number' => '49', 'role' => 'ironworker'],
            ['name' => 'Helder Pinto', 'employee_number' => '50', 'role' => 'ironworker'],
            ['name' => 'Paulo Silvestre', 'employee_number' => '51', 'role' => 'ironworker'],
            ['name' => 'André Teixeira', 'employee_number' => '52', 'role' => 'ironworker'],
            ['name' => 'Sérgio Dias', 'employee_number' => '53', 'role' => 'ironworker'],
            ['name' => 'Paulo Nunes', 'employee_number' => '54', 'role' => 'ironworker'],
            ['name' => 'Flávio Barreto', 'employee_number' => '55', 'role' => 'ironworker'],
            ['name' => 'José Chaminé', 'employee_number' => '56', 'role' => 'ironworker'],
        ];

        $employees = array_merge($electricians, $ironworkers);
        DB::table('employees')->insert($employees);
    }
}
