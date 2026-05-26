<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CarController extends Controller
{
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
            'mileage'       => 'nullable|integer|min:0',
            'photos.*'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $car = Car::create($request->only('brand', 'license_plate', 'mileage'));

        foreach ($request->file('photos', []) as $file) {
            $path = $file->store('cars/photos', 's3');
            $car->photos()->create(['path' => $path]);
        }

        return redirect()->route('cars.index');
    }

    public function show(string $id) {}

    public function edit(Car $car)
    {
        $car->load('photos');

        $photos = $car->photos->map(fn($p) => [
            'id'  => $p->id,
            'url' => Storage::disk('s3')->url($p->path),
        ]);

        return Inertia::render('Car/Edit', [
            'car'    => $car,
            'photos' => $photos,
        ]);
    }

    public function update(Request $request, Car $car)
    {
        $request->validate([
            'brand'         => 'required|string|max:100',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate,' . $car->id,
            'mileage'       => 'nullable|integer|min:0',
            'photos.*'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $car->update($request->only('brand', 'license_plate', 'mileage'));

        foreach ($request->file('photos', []) as $file) {
            $path = $file->store('cars/photos', 's3');
            $car->photos()->create(['path' => $path]);
        }

        return redirect()->route('cars.index');
    }

    public function destroyPhoto(CarPhoto $photo)
    {
        Storage::disk('s3')->delete($photo->path);
        $photo->delete();

        return back();
    }

    public function destroy(Car $car)
    {
        foreach ($car->photos as $photo) {
            Storage::disk('s3')->delete($photo->path);
        }

        $car->delete();

        return redirect()->route('cars.index');
    }
}
