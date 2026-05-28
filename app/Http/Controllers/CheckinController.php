<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\CheckinCreatedMail;
use App\Mail\CheckoutCompletedMail;
use App\Mail\LostItemsReplacementMail;
use App\Models\CheckinReplacement;
use App\Models\Car;
use App\Models\Checkin;
use App\Models\Employee;
use App\Models\PrintFormDocument;
use App\Models\ToolboxTemplate;
use App\Models\Tool;
use App\Models\Toolbag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

class CheckinController extends Controller
{
    public function index()
    {
        return Inertia::render('Checkin/Index', [
            'checkins' => Checkin::with(['employee', 'toolbag', 'car'])
                ->withCount('ppeForms')
                ->orderByRaw('planned_checkout_date IS NOT NULL AND status != ? DESC', ['checked_out'])
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        $takenCheckinTypes = Checkin::where('status', 'planned_checkout')
            ->get(['employee_id', 'toolbag_id', 'car_id', 'custom_items', 'is_ppe', 'is_template'])
            ->groupBy('employee_id')
            ->map(fn($checkins) => $checkins->map(fn($c) =>
                $c->car_id ? 'car' : ($c->toolbag_id ? 'toolbag' : ($c->is_ppe ? 'ppe' : ($c->is_template ? 'template' : 'custom')))
            )->values()->all());

        return inertia('Checkin/Create', [
            'employees'         => Employee::all(),
            'toolbags'          => Toolbag::whereNull('employee_id')->get(),
            'cars'              => Car::whereNull('employee_id')->get(),
            'documents'         => PrintFormDocument::orderBy('name')->get(['id', 'name']),
            'toolboxTemplates'  => ToolboxTemplate::orderBy('name')->get(['id', 'name']),
            'takenCheckinTypes' => $takenCheckinTypes,
        ]);
    }

    public function store(Request $request)
    {
        $isCar      = (bool) $request->input('is_car', false);
        $isPpe      = !$isCar && (bool) $request->input('is_ppe', false);
        $isTemplate = !$isCar && !$isPpe && (bool) $request->input('is_template', false);
        $isCustom   = !$isCar && !$isPpe && !$isTemplate && (bool) $request->input('is_custom', false);

        $rules = [
            'checkin_date'          => 'required|date',
            'notes'                 => 'nullable|string',
            'employee_id'           => 'required|exists:employees,id',
            'notification_emails'   => 'nullable|array',
            'notification_emails.*' => 'email',
            'ppe_items'             => 'nullable|array',
            'ppe_items.*.quantity'  => 'nullable|integer|min:1',
            'ppe_items.*.size'      => 'nullable|string|max:50',
            'ppe_items.*.notes'     => 'nullable|string|max:255',
            'employee_signature'    => 'nullable|string',
            'manager_signature'     => 'nullable|string',
        ];

        if ($isCar) {
            $rules['car_id']          = 'required|exists:cars,id';
            $rules['checkin_mileage'] = 'nullable|integer|min:0';
        } elseif ($isPpe) {
            $rules['pdf'] = 'required|file|mimes:pdf|max:20480';
        } elseif ($isTemplate) {
            $rules['toolbox_template_id'] = 'required|exists:toolbox_templates,id';
        } elseif ($isCustom) {
            $rules['custom_items']                    = 'required|array|min:1';
            $rules['custom_items.*.name']             = 'required|string|max:255';
            $rules['custom_items.*.replacement_cost'] = 'nullable|numeric|min:0';
        } else {
            $rules['toolbag_id'] = 'required|exists:toolbags,id';
        }

        // Document library attachments are available for all types except PPE/document.
        if (!$isPpe) {
            $rules['document_ids']   = 'nullable|array';
            $rules['document_ids.*'] = 'exists:print_form_documents,id';
        }

        $request->validate($rules);

        $activeQuery = Checkin::where('employee_id', $request->employee_id)
            ->where('status', 'planned_checkout');
        if ($isCar) {
            $activeQuery->whereNotNull('car_id');
        } elseif ($isPpe) {
            $activeQuery->where('is_ppe', true);
        } elseif ($isTemplate) {
            $activeQuery->where('is_template', true);
        } elseif ($isCustom) {
            $activeQuery->whereNotNull('custom_items');
        } else {
            $activeQuery->whereNotNull('toolbag_id');
        }
        if ($activeQuery->exists()) {
            $typeLabel = $isCar ? 'car' : ($isPpe ? 'PPE / document' : ($isTemplate ? 'template' : ($isCustom ? 'custom items' : 'toolbag')));
            return back()
                ->withErrors(['employee_id' => "This employee already has an active {$typeLabel} check-in. Check them out first."])
                ->withInput();
        }

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = null;
        $car      = null;

        if ($isCar) {
            $car = Car::findOrFail($request->car_id);
        } elseif (!$isCustom && !$isPpe && !$isTemplate) {
            $toolbag = Toolbag::findOrFail($request->toolbag_id);
            if ($employee->role !== $toolbag->type) {
                return back()
                    ->withErrors(['toolbag_id' => 'This toolbag is not allowed to check in with this employee.'])
                    ->withInput();
            }
        }

        $planned = Checkin::where('employee_id', $request->employee_id)
            ->where('status', 'planned_checkin')
            ->first();

        $checkinData = [
            'checkin_date'         => $request->checkin_date,
            'notes'                => $request->notes,
            'status'               => 'planned_checkout',
            'notification_emails'  => $request->notification_emails ?? [],
            'is_ppe'               => $isPpe,
            'is_template'          => $isTemplate,
            'toolbox_template_id'  => $isTemplate ? $request->toolbox_template_id : null,
            'toolbag_id'           => (!$isCar && !$isCustom && !$isPpe && !$isTemplate) ? $request->toolbag_id : null,
            'custom_items'         => $isCustom ? $request->custom_items : null,
            'car_id'               => $isCar ? $request->car_id : null,
            'checkin_mileage'      => $isCar ? $request->checkin_mileage : null,
            'ppe_items'            => $request->ppe_items ?? null,
        ];

        if ($planned) {
            $planned->update($checkinData);
            $checkin = $planned;
        } else {
            $checkin = Checkin::create(array_merge($checkinData, [
                'employee_id' => $request->employee_id,
            ]));
        }

        // For PPE type, store the uploaded PDF immediately as the signed check-in PDF.
        if ($isPpe && $request->hasFile('pdf')) {
            $pdfPath = "checkins/signed-checkins/{$checkin->id}-checkin.pdf";
            Storage::disk('s3')->putFileAs(
                'checkins/signed-checkins',
                $request->file('pdf'),
                "{$checkin->id}-checkin.pdf",
                'public'
            );
            $checkin->update([
                'signed_checkin_pdf_path' => $pdfPath,
                'contract_exported_at'    => now(),
            ]);
        }

        if ($toolbag) {
            $toolbag->update(['employee_id' => $request->employee_id]);
        }
        if ($car) {
            $existingCar = Car::where('employee_id', $request->employee_id)
                ->where('id', '!=', $car->id)
                ->first();
            if ($existingCar) {
                return back()
                    ->withErrors(['car_id' => "This employee already has a car assigned ({$existingCar->brand} — {$existingCar->license_plate}). Check it out first."])
                    ->withInput();
            }
            $car->update(['employee_id' => $request->employee_id]);
        }

        if (!$isPpe) {
            $checkin->documents()->sync($request->document_ids ?? []);
        }

        $checkin->load('employee', 'toolbag.tools', 'car', 'documents');

        // Inline sign & export when signatures are submitted with the form (multi-step flow).
        $hasSigs = !$isPpe
            && $request->filled('employee_signature')
            && $request->filled('manager_signature')
            && $request->expectsJson();

        $emailAttachments = [];

        if ($hasSigs) {
            $employeeSig = $request->employee_signature;
            $managerSig  = $request->manager_signature;

            $checkin->update([
                'contract_exported_at'       => now(),
                'employee_checkin_signature' => $employeeSig,
                'manager_checkin_signature'  => $managerSig,
            ]);

            $pdfPath = "checkins/signed-checkins/{$checkin->id}-checkin.pdf";
            $tmpPath = sys_get_temp_dir() . '/' . uniqid('checkin-pdf') . '.pdf';

            try {
                if ($isTemplate) {
                    // Generate a signature page and append it to the template PDF via Ghostscript.
                    $checkin->loadMissing('toolboxTemplate');
                    $template = $checkin->toolboxTemplate;

                    $sigPageTmp  = sys_get_temp_dir() . '/' . uniqid('sig-page-') . '.pdf';
                    $templateTmp = sys_get_temp_dir() . '/' . uniqid('tpl-') . '.pdf';

                    $templateContent = Storage::disk('s3')->get($template->file_path);
                    file_put_contents($templateTmp, $templateContent);

                    try {
                        Pdf::view('pdf.template-signature-page', [
                            'checkin'           => $checkin,
                            'employee'          => $checkin->employee,
                            'template'          => $template,
                            'employeeSignature' => $employeeSig,
                            'managerSignature'  => $managerSig,
                        ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                          ->save($sigPageTmp);

                        $cmd = sprintf(
                            'gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=%s %s %s 2>&1',
                            escapeshellarg($tmpPath),
                            escapeshellarg($templateTmp),
                            escapeshellarg($sigPageTmp)
                        );
                        exec($cmd, $gsOutput, $gsExit);

                        if ($gsExit !== 0) {
                            copy($sigPageTmp, $tmpPath);
                        }
                    } finally {
                        @unlink($sigPageTmp);
                        @unlink($templateTmp);
                    }

                    $mergedContent = file_get_contents($tmpPath);
                    Storage::disk('s3')->put($pdfPath, $mergedContent, 'public');

                    $empSlug = str_replace(' ', '-', strtolower($checkin->employee->name));
                    $emailAttachments = [
                        ['name' => $template->name . '.pdf',           'content' => $templateContent],
                        ['name' => "signed-checkin-{$empSlug}.pdf",    'content' => $mergedContent],
                    ];
                } elseif ($isCar) {
                    Pdf::view('pdf.car-checkin', [
                        'checkin'           => $checkin,
                        'employee'          => $checkin->employee,
                        'car'               => $checkin->car,
                        'employeeSignature' => $employeeSig,
                        'managerSignature'  => $managerSig,
                    ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                      ->save($tmpPath);

                    Storage::disk('s3')->put($pdfPath, file_get_contents($tmpPath), 'public');
                } else {
                    Pdf::view('pdf.checkin', [
                        'checkin'           => $checkin,
                        'employee'          => $checkin->employee,
                        'toolbag'           => $checkin->toolbag,
                        'tools'             => $checkin->toolbag ? $checkin->toolbag->tools : collect(),
                        'employeeSignature' => $employeeSig,
                        'managerSignature'  => $managerSig,
                    ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                      ->save($tmpPath);

                    Storage::disk('s3')->put($pdfPath, file_get_contents($tmpPath), 'public');
                }
            } finally {
                @unlink($tmpPath);
            }

            $checkin->update(['signed_checkin_pdf_path' => $pdfPath]);
        }

        // Email is sent after PDF generation so template attachments are available.
        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        foreach ($recipients as $email) {
            Mail::to($email)->send(new CheckinCreatedMail($checkin, $emailAttachments));
        }

        if ($hasSigs) {
            return response()->json(['url' => route('checkins.signed-pdf', $checkin)]);
        }

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Check-in created successfully.');
    }

    public function show(Checkin $checkin)
    {
        return Inertia::render('Checkin/Show', [
            'checkin' => $checkin->load('employee', 'toolbag', 'car', 'documents', 'replacements'),
        ]);
    }

    public function replacementPdf(CheckinReplacement $replacement)
    {
        abort_unless($replacement->pdf_path, 404, 'PDF not found.');
        return redirect(Storage::disk('s3')->url($replacement->pdf_path));
    }

    public function edit(Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        return Inertia::render('Checkin/Edit', [
            'checkin'             => $checkin->load('employee', 'toolbag', 'car'),
            'toolbags'            => Toolbag::all(),
            'cars'                => Car::where(fn($q) => $q->whereNull('employee_id')->orWhere('id', $checkin->car_id))->get(),
            'documents'           => PrintFormDocument::orderBy('name')->get(['id', 'name']),
            'selectedDocumentIds' => $checkin->documents()->pluck('print_form_documents.id')->toArray(),
        ]);
    }

    public function update(Request $request, Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        $isCar    = (bool) $checkin->car_id;
        $isCustom = !$isCar && !$checkin->toolbag_id && !empty($checkin->custom_items);

        $rules = [
            'checkin_date'          => 'required|date',
            'notes'                 => 'nullable|string',
            'employee_id'           => 'required|exists:employees,id',
            'document_ids'          => 'nullable|array',
            'document_ids.*'        => 'exists:print_form_documents,id',
            'ppe_items'             => 'nullable|array',
            'ppe_items.*.quantity'  => 'nullable|integer|min:1',
            'ppe_items.*.size'      => 'nullable|string|max:50',
            'ppe_items.*.notes'     => 'nullable|string|max:255',
        ];

        if ($isCar) {
            $rules['car_id']          = 'required|exists:cars,id';
            $rules['checkin_mileage'] = 'nullable|integer|min:0';
        } elseif ($isCustom) {
            $rules['custom_items']                    = 'required|array|min:1';
            $rules['custom_items.*.name']             = 'required|string|max:255';
            $rules['custom_items.*.replacement_cost'] = 'nullable|numeric|min:0';
        } else {
            $rules['toolbag_id'] = 'required|exists:toolbags,id';
        }

        $request->validate($rules);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = null;
        $car      = null;

        if ($checkin->car_id) {
            if (!$isCar || (int) $request->car_id !== $checkin->car_id) {
                $oldCar = Car::find($checkin->car_id);
                if ($oldCar) $oldCar->update(['employee_id' => null]);
            }
        }

        if ($isCar) {
            $car = Car::findOrFail($request->car_id);
        } elseif (!$isCustom) {
            $toolbag = Toolbag::findOrFail($request->toolbag_id);
            if ($employee->role !== $toolbag->type) {
                return back()
                    ->withErrors(['toolbag_id' => 'This toolbag is not allowed to check in with this employee.'])
                    ->withInput();
            }
            if ($checkin->toolbag_id && $checkin->toolbag_id !== (int) $request->toolbag_id) {
                $oldToolbag = Toolbag::find($checkin->toolbag_id);
                if ($oldToolbag) $oldToolbag->update(['employee_id' => null]);
            }
        } else {
            if ($checkin->toolbag_id) {
                $oldToolbag = Toolbag::find($checkin->toolbag_id);
                if ($oldToolbag) $oldToolbag->update(['employee_id' => null]);
            }
        }

        $checkin->update([
            'checkin_date'    => $request->checkin_date,
            'notes'           => $request->notes,
            'employee_id'     => $request->employee_id,
            'toolbag_id'      => (!$isCar && !$isCustom) ? $request->toolbag_id : null,
            'custom_items'    => $isCustom ? $request->custom_items : null,
            'car_id'          => $isCar ? $request->car_id : null,
            'checkin_mileage' => $isCar ? $request->checkin_mileage : null,
            'ppe_items'       => $request->ppe_items ?? null,
        ]);

        if ($toolbag) {
            $toolbag->update(['employee_id' => $request->employee_id]);
        }
        if ($car) {
            $car->update(['employee_id' => $request->employee_id]);
        }

        $checkin->documents()->sync($request->document_ids ?? []);

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Check-in updated successfully.');
    }

    public function destroy(Checkin $checkin)
    {
        // Free up any assigned toolbag or car before deleting.
        if ($checkin->toolbag_id) {
            Toolbag::find($checkin->toolbag_id)?->update(['employee_id' => null]);
        }
        if ($checkin->car_id) {
            Car::find($checkin->car_id)?->update(['employee_id' => null]);
        }

        $checkin->delete();

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Check-in deleted.');
    }

    public function pdf(Checkin $checkin)
    {
        // PPE / document type: PDF was uploaded at check-in time — just serve it.
        if ($checkin->is_ppe) {
            abort_unless($checkin->signed_checkin_pdf_path, 404, 'No PDF uploaded for this check-in.');
            return redirect(Storage::disk('s3')->url($checkin->signed_checkin_pdf_path));
        }

        // Template type: serve the referenced toolbox template PDF.
        if ($checkin->is_template) {
            $template = $checkin->toolboxTemplate;
            abort_unless($template, 404, 'Template not found for this check-in.');
            return redirect(Storage::disk('s3')->url($template->file_path));
        }

        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'The contract for this checkin has already been exported and cannot be exported again.');
        }

        $checkin->update(['contract_exported_at' => now()]);
        $checkin->load('employee', 'toolbag.tools', 'car');

        if ($checkin->car_id) {
            return Pdf::view('pdf.car-checkin', [
                'checkin'           => $checkin,
                'employee'          => $checkin->employee,
                'car'               => $checkin->car,
                'employeeSignature' => null,
                'managerSignature'  => null,
            ])
                ->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                ->name("car-checkin-{$checkin->employee->name}.pdf")
                ->inline();
        }

        return Pdf::view('pdf.checkin', [
            'checkin'           => $checkin,
            'employee'          => $checkin->employee,
            'toolbag'           => $checkin->toolbag,
            'tools'             => $checkin->toolbag->tools,
            'employeeSignature' => null,
            'managerSignature'  => null,
        ])
            ->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
            ->name("checkin-{$checkin->employee->name}.pdf")
            ->inline();
    }

    public function signAndExport(Request $request, Checkin $checkin)
    {
        if ($checkin->is_ppe) {
            return response()->json(['error' => 'PPE / document check-ins do not support sign & export.'], 422);
        }

        if ($checkin->is_template) {
            return response()->json(['error' => 'Template check-ins do not support sign & export.'], 422);
        }

        if ($checkin->contract_exported_at) {
            return response()->json(['error' => 'Contract already exported.'], 422);
        }

        $request->validate([
            'employee_signature' => 'required|string',
            'manager_signature'  => 'required|string',
        ]);

        $checkin->load('employee', 'toolbag.tools', 'car');

        $employeeSignature = $request->employee_signature;
        $managerSignature  = $request->manager_signature;

        $pdfPath = "checkins/signed-checkins/{$checkin->id}-checkin.pdf";
        $tmpPath = sys_get_temp_dir() . '/' . uniqid('checkin-pdf') . '.pdf';

        try {
            if ($checkin->car_id) {
                Pdf::view('pdf.car-checkin', [
                    'checkin'           => $checkin,
                    'employee'          => $checkin->employee,
                    'car'               => $checkin->car,
                    'employeeSignature' => $employeeSignature,
                    'managerSignature'  => $managerSignature,
                ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                  ->save($tmpPath);
            } else {
                Pdf::view('pdf.checkin', [
                    'checkin'           => $checkin,
                    'employee'          => $checkin->employee,
                    'toolbag'           => $checkin->toolbag,
                    'tools'             => $checkin->toolbag ? $checkin->toolbag->tools : collect(),
                    'employeeSignature' => $employeeSignature,
                    'managerSignature'  => $managerSignature,
                ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                  ->save($tmpPath);
            }

            Storage::disk('s3')->put($pdfPath, file_get_contents($tmpPath), 'public');
        } finally {
            @unlink($tmpPath);
        }

        $checkin->update([
            'contract_exported_at'       => now(),
            'employee_checkin_signature' => $employeeSignature,
            'manager_checkin_signature'  => $managerSignature,
            'signed_checkin_pdf_path'    => $pdfPath,
        ]);

        return response()->json(['url' => route('checkins.signed-pdf', $checkin)]);
    }

    public function viewSignedPdf(Checkin $checkin)
    {
        abort_unless($checkin->signed_checkin_pdf_path, 404, 'PDF not found.');
        return redirect(Storage::disk('s3')->url($checkin->signed_checkin_pdf_path));
    }

    public function uploadPdf(Request $request, Checkin $checkin)
    {
        $request->validate(['pdf' => 'required|file|mimes:pdf|max:20480']);

        $pdfPath = "checkins/signed-checkins/{$checkin->id}-checkin.pdf";
        Storage::disk('s3')->putFileAs('checkins/signed-checkins', $request->file('pdf'), "{$checkin->id}-checkin.pdf", 'public');

        $checkin->update([
            'signed_checkin_pdf_path' => $pdfPath,
            'contract_exported_at'    => $checkin->contract_exported_at ?? now(),
        ]);

        return redirect()->route('checkins.index')->with('success', 'Check-in PDF uploaded.');
    }

    public function uploadCheckoutPdf(Request $request, Checkin $checkin)
    {
        $request->validate(['pdf' => 'required|file|mimes:pdf|max:20480']);

        $pdfPath = "checkins/signed-checkins/{$checkin->id}-checkout.pdf";
        Storage::disk('s3')->putFileAs('checkins/signed-checkins', $request->file('pdf'), "{$checkin->id}-checkout.pdf", 'public');

        $update = ['signed_checkout_pdf_path' => $pdfPath];

        if (!$checkin->checkout_date) {
            $update['checkout_date'] = now()->toDateString();
            $update['status']        = 'checked_out';
        }

        $checkin->update($update);

        return redirect()->route('checkins.index')->with('success', 'Checkout PDF uploaded.');
    }

    public function checkoutShow(Checkin $checkin)
    {
        $checkin->load('employee', 'toolbag.tools', 'car');

        return Inertia::render('Checkin/Checkout', [
            'checkin' => $checkin,
        ]);
    }

    public function checkoutProcess(Request $request, Checkin $checkin)
    {
        $isCar = (bool) $checkin->car_id;

        $rules = [
            'employee_signature' => 'required|string',
            'manager_signature'  => 'required|string',
        ];

        if ($isCar) {
            $rules['checkout_mileage'] = 'nullable|integer|min:0';
        } else {
            $rules['missing_tool_ids']   = 'nullable|array';
            $rules['missing_tool_ids.*'] = 'integer|exists:tools,id';
        }

        $request->validate($rules);

        $updateData = [
            'checkout_date'               => now()->toDateString(),
            'status'                      => 'checked_out',
            'employee_checkout_signature' => $request->employee_signature,
            'manager_checkout_signature'  => $request->manager_signature,
        ];

        if ($isCar) {
            $updateData['checkout_mileage'] = $request->checkout_mileage;
        } else {
            $updateData['missing_tools'] = $request->missing_tool_ids ?? [];
        }

        $checkin->update($updateData);

        if ($isCar) {
            $checkin->car->update(['employee_id' => null]);
        } elseif ($checkin->toolbag) {
            $toolbag        = $checkin->toolbag;
            $missingToolIds = $request->missing_tool_ids ?? [];
            $toolbag->update(['employee_id' => null]);
            if (!empty($missingToolIds)) {
                $toolbag->tools()->detach($missingToolIds);
            }
            $requiredTools  = Tool::whereIn('roletype', ['shared', $toolbag->type])->get();
            $currentToolIds = $toolbag->tools()->pluck('tools.id');
            $toolbag->update(['complete' => $requiredTools->pluck('id')->every(fn($id) => $currentToolIds->contains($id))]);
        }

        $checkin->load('employee', 'toolbag.tools', 'car');

        $missingToolIds = $checkin->missing_tools ?? [];
        $missingTools   = !$isCar ? Tool::whereIn('id', $missingToolIds)->get() : collect();
        $totalCost      = $missingTools->sum('replacement_cost');

        $pdfPath    = "checkins/signed-checkins/{$checkin->id}-checkout.pdf";
        $tmpPath    = sys_get_temp_dir() . '/' . uniqid('checkout-pdf') . '.pdf';
        $pdfContent = null;

        try {
            if ($isCar) {
                Pdf::view('pdf.car-checkout', [
                    'checkin'           => $checkin,
                    'employee'          => $checkin->employee,
                    'car'               => $checkin->car,
                    'employeeSignature' => $request->employee_signature,
                    'managerSignature'  => $request->manager_signature,
                ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                  ->save($tmpPath);
            } else {
                Pdf::view('pdf.checkout', [
                    'checkin'           => $checkin,
                    'employee'          => $checkin->employee,
                    'missingTools'      => $missingTools,
                    'totalCost'         => $totalCost,
                    'employeeSignature' => $request->employee_signature,
                    'managerSignature'  => $request->manager_signature,
                ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
                  ->save($tmpPath);
            }

            $pdfContent = file_get_contents($tmpPath);
            Storage::disk('s3')->put($pdfPath, $pdfContent, 'public');
        } finally {
            @unlink($tmpPath);
        }

        $checkin->update(['signed_checkout_pdf_path' => $pdfPath]);

        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        if ($recipients && !$isCar && $pdfContent) {
            foreach ($recipients as $email) {
                Mail::to($email)->send(new CheckoutCompletedMail($checkin, $totalCost, $pdfContent));
            }
        }

        return redirect()->route('checkins.index')->with('success', 'Checkout completed.');
    }

    public function checkoutPdf(Checkin $checkin)
    {
        abort_unless($checkin->signed_checkout_pdf_path, 404, 'PDF not found.');
        return redirect(Storage::disk('s3')->url($checkin->signed_checkout_pdf_path));
    }

    public function lostItemsShow(Checkin $checkin)
    {
        $checkin->load(['employee', 'toolbag.tools']);

        return Inertia::render('Checkin/LostItems', [
            'checkin' => $checkin,
        ]);
    }

    public function lostItemsProcess(Request $request, Checkin $checkin)
    {
        $request->validate([
            'tool_ids'             => 'nullable|array',
            'tool_ids.*'           => 'integer|exists:tools,id',
            'custom_items'         => 'nullable|array',
            'custom_items.*.name'  => 'required|string|max:255',
            'custom_items.*.price' => 'nullable|numeric|min:0',
            'employee_signature'   => 'required|string',
            'manager_signature'    => 'required|string',
        ]);

        $toolIds     = $request->tool_ids ?? [];
        $customItems = $request->custom_items ?? [];

        abort_if(count($toolIds) === 0 && count($customItems) === 0, 422, 'Select at least one tool or add a custom item.');

        $checkin->load(['employee', 'toolbag.tools']);

        if ($toolIds) {
            Tool::whereIn('id', $toolIds)->decrement('amount_in_stock');
        }

        $tools = $toolIds ? Tool::whereIn('id', $toolIds)->get() : collect();

        $pdfPath    = "checkins/replacements/{$checkin->id}-replacement-" . now()->timestamp . ".pdf";
        $tmpPath    = sys_get_temp_dir() . '/' . uniqid('lost-items-pdf') . '.pdf';
        $pdfContent = null;

        try {
            Pdf::view('pdf.lost-items-replacement', [
                'checkin'           => $checkin,
                'employee'          => $checkin->employee,
                'tools'             => $tools,
                'customItems'       => $customItems,
                'employeeSignature' => $request->employee_signature,
                'managerSignature'  => $request->manager_signature,
                'date'              => now()->format('d-m-Y'),
            ])->withBrowsershot(fn (Browsershot $b) => $b->noSandbox()->setChromePath('/usr/bin/google-chrome'))
              ->save($tmpPath);

            $pdfContent = file_get_contents($tmpPath);
            Storage::disk('s3')->put($pdfPath, $pdfContent, 'public');
        } finally {
            @unlink($tmpPath);
        }

        CheckinReplacement::create([
            'checkin_id'         => $checkin->id,
            'replaced_tools'     => $toolIds,
            'custom_items'       => $customItems ?: null,
            'employee_signature' => $request->employee_signature,
            'manager_signature'  => $request->manager_signature,
            'pdf_path'           => $pdfPath,
        ]);

        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        if ($recipients && $pdfContent) {
            foreach ($recipients as $email) {
                Mail::to($email)->send(new LostItemsReplacementMail($checkin, $tools, $customItems, $pdfContent));
            }
        }

        return redirect()->route('checkins.index')->with('success', 'Replacement recorded and email sent.');
    }

    private function buildRecipients(array $typedEmails): array
    {
        $company = config('mail.notification_emails', []);
        $all = array_filter(array_unique(array_merge($typedEmails, $company)));
        return array_values($all);
    }
}
