<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Checkin;
use App\Models\Employee;
use App\Models\Toolbag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class CheckinController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Checkin/Index', [
            'checkins' => Checkin::with(['employee', 'toolbag'])->latest()->get(),
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Checkin/Create', [
            'employees' => Employee::all(),
            'toolbags' => Toolbag::whereNull('employee_id')->get(),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'checkin_date' => 'required|date',
            'notes' => 'nullable|string',
            'employee_id' => 'required|exists:employees,id',
            'toolbag_id' => 'required|exists:toolbags,id',
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag = Toolbag::findOrFail($request->toolbag_id);

        // Validate whether employee has a toolbag of the same type
        if ($employee->role !== $toolbag->type) {
            return back()
                ->withErrors([
                    'toolbag_id' => 'This toolbag is not allowed to check in with this employee.'
                ])
                ->withInput();
        }

        Checkin::create([
            'checkin_date' => $request->checkin_date,
            'notes'        => $request->notes,
            'employee_id'  => $request->employee_id,
            'toolbag_id'   => $request->toolbag_id,
        ]);

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Checkin succesvol aangemaakt.');
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Checkin $checkin)
    {
        return Inertia::render('Checkin/Edit', [
            'checkin' => $checkin->load('employee', 'toolbag'),
            'toolbags' => Toolbag::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function pdf(Checkin $checkin)
    {
        $checkin->load('employee', 'toolbag.tools');

        return Pdf::view('pdf.checkin', [
            'checkin'  => $checkin,
            'employee' => $checkin->employee,
            'toolbag'  => $checkin->toolbag,
            'tools'    => $checkin->toolbag->tools,
        ])
            ->name("checkin-{$checkin->employee->name}.pdf")
            ->inline();
    }

    public function checkout(Checkin $checkin)
    {
        $checkin->update([
            'checkout_date' => now()->toDateString(),
        ]);

        return redirect()->route('checkins.index')
            ->with('success', 'Checkout completed.');
    }

}
