<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PrintFormDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class PrintFormController extends Controller
{
    public function index()
    {
        return Inertia::render('PrintForms/Index', [
            'employees' => Employee::orderBy('name')->get(),
            'documents' => PrintFormDocument::with('uploader')
                ->latest()
                ->get()
                ->map(fn($doc) => [
                    'id'          => $doc->id,
                    'name'        => $doc->name,
                    'uploaded_by' => $doc->uploader?->name,
                    'created_at'  => $doc->created_at->format('d-m-Y'),
                ]),
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'pdf'  => 'required|file|mimes:pdf|max:20480',
        ]);

        $path = $request->file('pdf')->store('print-forms', 'public');

        PrintFormDocument::create([
            'name'        => $request->name,
            'file_path'   => $path,
            'uploaded_by' => $request->user()->id,
        ]);

        return redirect()->route('print-forms.index')
            ->with('success', 'Document uploaded successfully.');
    }

    public function download(PrintFormDocument $document)
    {
        abort_unless(Storage::disk('public')->exists($document->file_path), 404);

        return Storage::disk('public')->download($document->file_path, $document->name . '.pdf');
    }

    public function destroy(PrintFormDocument $document)
    {
        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return redirect()->route('print-forms.index')
            ->with('success', 'Document deleted.');
    }

    public function ppe(Request $request, Employee $employee)
    {
        return Pdf::view('pdf.ppe-issue-form-print', [
            'employee'              => $employee,
            'admission_date'        => now()->toDateString(),
            'professional_category' => $employee->role,
            'notes'                 => $request->query('notes', ''),
            'ppe'                   => [],
        ])
            ->name("ppe-issue-form-{$employee->name}.pdf")
            ->inline();
    }
}
