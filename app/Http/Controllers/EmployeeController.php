<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Checkin;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::with('latestCheckin')->orderBy('name')->get();

        return Inertia::render('Employee/Index', ['employees' => $employees]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Employee/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'employee_number' => 'nullable|string|unique:employees,employee_number',
            'role' => 'required|string',
        ]);

        Employee::create($validated);
        return redirect()->route('employees.index');
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
    public function edit(Employee $employee)
    {
        return Inertia::render('Employee/Edit', [
            'employee' => $employee
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'employee_number' => 'nullable|string|unique:employees,employee_number,' . $employee->id,
            'role' => 'required|string',
            'remark' => 'nullable|string',
        ]);

        $employee->update($validated);
        return redirect()->route('employees.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()
            ->route('employees.index')
            ->with('success', 'Employee deleted successfully.');
    }

    /**
     * Plan a checkin for an employee (admin only).
     */
    public function planCheckin(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'checkin_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        Checkin::create([
            'employee_id' => $employee->id,
            'checkin_date' => $validated['checkin_date'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'planned_checkin',
        ]);

        return redirect()
            ->route('employees.index')
            ->with('success', 'Checkin planned successfully.');
    }
}
