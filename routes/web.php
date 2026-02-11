<?php

use App\Http\Controllers\CheckinController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolController;
use App\Http\Controllers\ToolbagController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PrintFormController;
use App\Http\Controllers\UserManagementController;
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
    Route::resource('tools', ToolController::class)->except(['destroy']);
    Route::patch('tools/{tool}/increment-stock', [ToolController::class, 'incrementStock'])
        ->name('tools.incrementStock');
    Route::patch('tools/{tool}/decrement-stock', [ToolController::class, 'decrementStock'])
        ->name('tools.decrementStock');

    Route::resource('toolbags', ToolbagController::class)->except(['destroy']);
    Route::post('/toolbags/{toolbag}/assign', [ToolbagController::class, 'assign'])
        ->name('toolbags.assign');

    Route::resource('checkins', CheckinController::class)->except(['destroy']);
    Route::get('/checkins/{checkin}/pdf', [CheckinController::class, 'pdf'])
        ->name('checkins.pdf');
    Route::get('/checkins/{checkin}/checkout', [CheckinController::class, 'checkout'])
        ->name('checkins.checkout');

    Route::resource('cars', CarController::class)->except(['destroy']);

    Route::get('/print-forms', [PrintFormController::class, 'index'])->name('print-forms.index');
    Route::get('/print-forms/ppe/{employee}', [PrintFormController::class, 'ppe'])->name('print-forms.ppe');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('employees', EmployeeController::class);
    Route::resource('users', UserManagementController::class);

    Route::delete('/tools/{tool}', [ToolController::class, 'destroy'])->name('tools.destroy');
    Route::delete('/toolbags/{toolbag}', [ToolbagController::class, 'destroy'])->name('toolbags.destroy');
    Route::delete('/checkins/{checkin}', [CheckinController::class, 'destroy'])->name('checkins.destroy');
    Route::delete('/cars/{car}', [CarController::class, 'destroy'])->name('cars.destroy');
});

require __DIR__.'/auth.php';
