<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Car;
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
        return Inertia::render('Car/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'brand'         => 'required|string|max:100',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate',
        ]);

        Car::create($request->only('brand', 'license_plate'));

        return redirect()->route('cars.index');
    }

    public function show(string $id) {}

    public function edit(Car $car)
    {
        return Inertia::render('Car/Edit', [
            'car' => $car,
        ]);
    }

    public function update(Request $request, Car $car)
    {
        $request->validate([
            'brand'         => 'required|string|max:100',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate,' . $car->id,
        ]);

        $car->update($request->only('brand', 'license_plate'));

        return redirect()->route('cars.index');
    }

    public function destroy(Car $car)
    {
        $car->delete();

        return redirect()->route('cars.index');
    }
}
