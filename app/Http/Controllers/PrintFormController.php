<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class PrintFormController extends Controller
{
    public function index()
    {
        return Inertia::render('PrintForms/Index', [
            'employees' => Employee::orderBy('name')->get(),
        ]);
    }

    public function ppe(Request $request, Employee $employee)
    {
        return Pdf::view('pdf.ppe-issue-form-print', [
            'employee' => $employee,
            'admission_date' => now()->toDateString(),
            'professional_category' => $employee->role,
            'notes' => $request->query('notes', ''),
            'ppe' => [],
        ])
            ->name("ppe-issue-form-{$employee->name}.pdf")
            ->inline();
    }
}
