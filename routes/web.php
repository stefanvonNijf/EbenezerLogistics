<?php

use App\Http\Controllers\CheckinController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\ToolbagController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::post('/tools/{tool}', [ToolController::class, 'update'])
        ->name('tools.update');
    Route::resource('tools', ToolController::class);
    Route::patch('tools/{tool}/increment-stock', [ToolController::class, 'incrementStock'])
        ->name('tools.incrementStock');
    Route::patch('tools/{tool}/decrement-stock', [ToolController::class, 'decrementStock'])
        ->name('tools.decrementStock');

    Route::resource('toolbags', ToolbagController::class);
    Route::post('/toolbags/{toolbag}/assign', [ToolbagController::class, 'assign'])
        ->name('toolbags.assign');

    Route::resource('checkins', CheckinController::class);
    Route::get('/checkins/{checkin}/pdf', [CheckinController::class, 'pdf'])
        ->name('checkins.pdf');
    Route::get('/checkins/{checkin}/checkout', [CheckinController::class, 'checkout'])
        ->name('checkins.checkout');


    Route::resource('cars', CarController::class);

    Route::resource('employees', EmployeeController::class);
});

require __DIR__.'/auth.php';
