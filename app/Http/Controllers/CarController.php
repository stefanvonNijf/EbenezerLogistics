<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Car/Index', [
            'cars' => Car::with('employee')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Car/Create', [
            'employees' => Employee::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'brand'         => 'required|string|max:100',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate',
            'employee_id'   => 'nullable|exists:employees,id',
        ]);

        Car::create($request->only('brand', 'license_plate', 'employee_id'));

        return redirect()->route('cars.index');
    }

    public function show(string $id) {}

    public function edit(Car $car)
    {
        return Inertia::render('Car/Edit', [
            'car'       => $car->load('employee'),
            'employees' => Employee::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Car $car)
    {
        $request->validate([
            'brand'         => 'required|string|max:100',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate,' . $car->id,
            'employee_id'   => 'nullable|exists:employees,id',
        ]);

        $car->update($request->only('brand', 'license_plate', 'employee_id'));

        return redirect()->route('cars.index');
    }

    public function destroy(Car $car)
    {
        $car->delete();

        return redirect()->route('cars.index');
    }
}
