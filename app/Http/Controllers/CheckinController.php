<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\CheckinCreatedMail;
use App\Mail\CheckoutCompletedMail;
use App\Models\Checkin;
use App\Models\Employee;
use App\Models\Tool;
use App\Models\Toolbag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

class CheckinController extends Controller
{
    public function index()
    {
        return Inertia::render('Checkin/Index', [
            'checkins' => Checkin::with(['employee', 'toolbag'])
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
        ]);
    }

    public function store(Request $request)
    {
        $isCustom = (bool) $request->input('is_custom', false);

        $rules = [
            'checkin_date'         => 'required|date',
            'notes'                => 'nullable|string',
            'employee_id'          => 'required|exists:employees,id',
            'notification_emails'  => 'nullable|array',
            'notification_emails.*'=> 'email',
        ];

        if ($isCustom) {
            $rules['custom_items']                      = 'required|array|min:1';
            $rules['custom_items.*.name']               = 'required|string|max:255';
            $rules['custom_items.*.replacement_cost']   = 'nullable|numeric|min:0';
        } else {
            $rules['toolbag_id'] = 'required|exists:toolbags,id';
        }

        $request->validate($rules);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = null;

        if (!$isCustom) {
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
            'toolbag_id'          => $isCustom ? null : $request->toolbag_id,
            'custom_items'        => $isCustom ? $request->custom_items : null,
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

        // Send checkin notification emails
        $checkin->load('employee', 'toolbag.tools');
        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        foreach ($recipients as $email) {
            Mail::to($email)->send(new CheckinCreatedMail($checkin));
        }

        return redirect()
            ->route('checkins.index')
            ->with('success', 'Checkin succesvol aangemaakt.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        return Inertia::render('Checkin/Edit', [
            'checkin'  => $checkin->load('employee', 'toolbag'),
            'toolbags' => Toolbag::all(),
        ]);
    }

    public function update(Request $request, Checkin $checkin)
    {
        if ($checkin->contract_exported_at) {
            return redirect()->route('checkins.index')
                ->with('error', 'This checkin has been exported as a contract and can no longer be edited.');
        }

        $isCustom = (bool) $request->input('is_custom', false);

        $rules = [
            'checkin_date' => 'required|date',
            'notes'        => 'nullable|string',
            'employee_id'  => 'required|exists:employees,id',
        ];

        if ($isCustom) {
            $rules['custom_items']                      = 'required|array|min:1';
            $rules['custom_items.*.name']               = 'required|string|max:255';
            $rules['custom_items.*.replacement_cost']   = 'nullable|numeric|min:0';
        } else {
            $rules['toolbag_id'] = 'required|exists:toolbags,id';
        }

        $request->validate($rules);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = null;

        if (!$isCustom) {
            $toolbag = Toolbag::findOrFail($request->toolbag_id);

            if ($employee->role !== $toolbag->type) {
                return back()
                    ->withErrors(['toolbag_id' => 'This toolbag is not allowed to check in with this employee.'])
                    ->withInput();
            }

            if ($checkin->toolbag_id && $checkin->toolbag_id !== (int) $request->toolbag_id) {
                $oldToolbag = Toolbag::find($checkin->toolbag_id);
                if ($oldToolbag) {
                    $oldToolbag->update(['employee_id' => null]);
                }
            }
        } else {
            // Switching to custom — release any previously assigned toolbag
            if ($checkin->toolbag_id) {
                $oldToolbag = Toolbag::find($checkin->toolbag_id);
                if ($oldToolbag) {
                    $oldToolbag->update(['employee_id' => null]);
                }
            }
        }

        $checkin->update([
            'checkin_date' => $request->checkin_date,
            'notes'        => $request->notes,
            'employee_id'  => $request->employee_id,
            'toolbag_id'   => $isCustom ? null : $request->toolbag_id,
            'custom_items' => $isCustom ? $request->custom_items : null,
        ]);

        if ($toolbag) {
            $toolbag->update(['employee_id' => $request->employee_id]);
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
        $checkin->load('employee', 'toolbag.tools');

        return Pdf::view('pdf.checkin', [
            'checkin'  => $checkin,
            'employee' => $checkin->employee,
            'toolbag'  => $checkin->toolbag,
            'tools'    => $checkin->toolbag->tools,
        ])
            ->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot->noSandbox()
                    ->setChromePath('/usr/bin/google-chrome');
            })
            ->name("checkin-{$checkin->employee->name}.pdf")
            ->inline();
    }

    public function checkoutShow(Checkin $checkin)
    {
        $checkin->load('employee', 'toolbag.tools');

        return Inertia::render('Checkin/Checkout', [
            'checkin' => $checkin,
        ]);
    }

    public function checkoutProcess(Request $request, Checkin $checkin)
    {
        $request->validate([
            'missing_tool_ids'   => 'nullable|array',
            'missing_tool_ids.*' => 'integer|exists:tools,id',
        ]);

        $checkin->update([
            'checkout_date' => now()->toDateString(),
            'status'        => 'checked_out',
            'missing_tools' => $request->missing_tool_ids ?? [],
        ]);

        if ($checkin->toolbag) {
            $toolbag = $checkin->toolbag;
            $toolbag->update(['employee_id' => null]);

            $missingToolIds = $request->missing_tool_ids ?? [];
            if (!empty($missingToolIds)) {
                $toolbag->tools()->detach($missingToolIds);
            }

            $requiredTools = Tool::whereIn('roletype', ['shared', $toolbag->type])->get();
            $currentToolIds = $toolbag->tools()->pluck('tools.id');
            $isComplete = $requiredTools->pluck('id')->every(
                fn($id) => $currentToolIds->contains($id)
            );
            $toolbag->update(['complete' => $isComplete]);
        }

        // Send checkout notification emails
        $checkin->load('employee', 'toolbag.tools');
        $missingToolIds = $checkin->missing_tools ?? [];
        $missingTools   = Tool::whereIn('id', $missingToolIds)->get();
        $totalCost = $missingTools->sum('replacement_cost');

        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        if ($recipients) {
            $tempPath = storage_path('app/checkout-' . $checkin->id . '.pdf');
            Pdf::view('pdf.checkout', [
                'checkin'      => $checkin,
                'employee'     => $checkin->employee,
                'missingTools' => $missingTools,
                'totalCost'    => $totalCost,
            ])->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot->noSandbox()
                    ->setChromePath('/usr/bin/google-chrome');
            })->save($tempPath);

            $pdfContent = file_get_contents($tempPath);
            @unlink($tempPath);

            foreach ($recipients as $email) {
                Mail::to($email)->send(new CheckoutCompletedMail($checkin, $totalCost, $pdfContent));
            }
        }

        return redirect()->route('checkins.index')
            ->with('success', 'Checkout completed.');
    }

    public function checkoutPdf(Checkin $checkin)
    {
        $checkin->load('employee', 'toolbag.tools');

        $missingToolIds = $checkin->missing_tools ?? [];
        $missingTools   = Tool::whereIn('id', $missingToolIds)->get();
        $totalCost = $missingTools->sum('replacement_cost');

        return Pdf::view('pdf.checkout', [
            'checkin'      => $checkin,
            'employee'     => $checkin->employee,
            'missingTools' => $missingTools,
            'totalCost'    => $totalCost,
        ])
            ->withBrowsershot(function (Browsershot $browsershot) {
                $browsershot->noSandbox()
                    ->setChromePath('/usr/bin/google-chrome');
            })
            ->name("checkout-{$checkin->employee->name}.pdf")
            ->inline();
    }

    /**
     * Combine typed-in emails with the fixed company notification email.
     */
    private function buildRecipients(array $typedEmails): array
    {
        $company = config('mail.notification_emails', []);
        $all = array_filter(array_unique(array_merge($typedEmails, $company)));
        return array_values($all);
    }
}
