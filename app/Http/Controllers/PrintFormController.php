<?php

namespace App\Http\Controllers;

use App\Models\Checkin;
use App\Models\CheckinPpeForm;
use App\Models\Employee;
use App\Models\PrintFormDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

class PrintFormController extends Controller
{
    public function index()
    {
        return Inertia::render('PrintForms/Index', [
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

        $path = $request->file('pdf')->store('documents', 's3');

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
        return redirect(Storage::disk('s3')->url($document->file_path));
    }

    public function destroy(PrintFormDocument $document)
    {
        Storage::disk('s3')->delete($document->file_path);
        $document->delete();

        return redirect()->route('print-forms.index')
            ->with('success', 'Document deleted.');
    }

    public function ppe(Request $request, Employee $employee)
    {
        $checkin = null;

        if ($request->query('checkin_id')) {
            $checkin = Checkin::find($request->query('checkin_id'));
            if ($checkin) {
                CheckinPpeForm::create([
                    'checkin_id' => $checkin->id,
                    'notes'      => $request->query('notes', '') ?: null,
                ]);
            }
        }

        return Pdf::view('pdf.ppe-issue-form-print', [
            'employee'              => $employee,
            'admission_date'        => $checkin?->checkin_date ?? now()->toDateString(),
            'professional_category' => $employee->role,
            'notes'                 => $request->query('notes', ''),
            'ppe'                   => $checkin?->ppe_items ?? [],
        ])
            ->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot->noSandbox()
                    ->setChromePath('/usr/bin/google-chrome');
            })
            ->name("ppe-issue-form-{$employee->name}.pdf")
            ->inline();
    }
}
