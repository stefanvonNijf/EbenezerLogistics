<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\CheckinCreatedMail;
use App\Mail\CheckoutCompletedMail;
use App\Models\Car;
use App\Models\Checkin;
use App\Models\Employee;
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
        return inertia('Checkin/Create', [
            'employees' => Employee::all(),
            'toolbags'  => Toolbag::whereNull('employee_id')->get(),
            'cars'      => Car::whereNull('employee_id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $isCar    = (bool) $request->input('is_car', false);
        $isCustom = !$isCar && (bool) $request->input('is_custom', false);

        $rules = [
            'checkin_date'         => 'required|date',
            'notes'                => 'nullable|string',
            'employee_id'          => 'required|exists:employees,id',
            'notification_emails'  => 'nullable|array',
            'notification_emails.*'=> 'email',
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

        if ($isCar) {
            $car = Car::findOrFail($request->car_id);
        } elseif (!$isCustom) {
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
            'checkin_date'        => $request->checkin_date,
            'notes'               => $request->notes,
            'status'              => 'planned_checkout',
            'notification_emails' => $request->notification_emails ?? [],
            'toolbag_id'          => (!$isCar && !$isCustom) ? $request->toolbag_id : null,
            'custom_items'        => $isCustom ? $request->custom_items : null,
            'car_id'              => $isCar ? $request->car_id : null,
            'checkin_mileage'     => $isCar ? $request->checkin_mileage : null,
        ];

        if ($planned) {
            $planned->update($checkinData);
            $checkin = $planned;
        } else {
            $checkin = Checkin::create(array_merge($checkinData, [
                'employee_id' => $request->employee_id,
            ]));
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

        $checkin->load('employee', 'toolbag.tools', 'car');
        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        foreach ($recipients as $email) {
            Mail::to($email)->send(new CheckinCreatedMail($checkin));
        }

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Checkin succesvol aangemaakt.');
    }

    public function show(Checkin $checkin)
    {
        return Inertia::render('Checkin/Show', [
            'checkin' => $checkin->load('employee', 'toolbag', 'car'),
        ]);
    }

    public function edit(Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        return Inertia::render('Checkin/Edit', [
            'checkin'  => $checkin->load('employee', 'toolbag', 'car'),
            'toolbags' => Toolbag::all(),
            'cars'     => Car::all(),
        ]);
    }

    public function update(Request $request, Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        $isCar    = (bool) $request->input('is_car', false);
        $isCustom = !$isCar && (bool) $request->input('is_custom', false);

        $rules = [
            'checkin_date' => 'required|date',
            'notes'        => 'nullable|string',
            'employee_id'  => 'required|exists:employees,id',
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
        ]);

        if ($toolbag) {
            $toolbag->update(['employee_id' => $request->employee_id]);
        }
        if ($car) {
            $car->update(['employee_id' => $request->employee_id]);
        }

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Checkin succesvol bijgewerkt.');
    }

    public function destroy(string $id)
    {
        //
    }

    public function pdf(Checkin $checkin)
    {
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
        $tmpPath = tempnam(sys_get_temp_dir(), 'checkin-pdf');

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
        $tmpPath    = tempnam(sys_get_temp_dir(), 'checkout-pdf');
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

    private function buildRecipients(array $typedEmails): array
    {
        $company = config('mail.notification_emails', []);
        $all = array_filter(array_unique(array_merge($typedEmails, $company)));
        return array_values($all);
    }
}
