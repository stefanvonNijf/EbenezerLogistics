<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\CheckinCreatedMail;
use App\Mail\CheckoutCompletedMail;
use App\Models\Checkin;
use App\Models\Employee;
use App\Models\Toolbag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Spatie\LaravelPdf\Facades\Pdf;

class CheckinController extends Controller
{
    public function index()
    {
        return Inertia::render('Checkin/Index', [
            'checkins' => Checkin::with(['employee', 'toolbag'])
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
        $request->validate([
            'checkin_date'         => 'required|date',
            'notes'                => 'nullable|string',
            'employee_id'          => 'required|exists:employees,id',
            'toolbag_id'           => 'required|exists:toolbags,id',
            'notification_emails'  => 'nullable|array',
            'notification_emails.*'=> 'email',
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = Toolbag::findOrFail($request->toolbag_id);

        if ($employee->role !== $toolbag->type) {
            return back()
                ->withErrors(['toolbag_id' => 'This toolbag is not allowed to check in with this employee.'])
                ->withInput();
        }

        $planned = Checkin::where('employee_id', $request->employee_id)
            ->where('status', 'planned_checkin')
            ->first();

        if ($planned) {
            $planned->update([
                'checkin_date'        => $request->checkin_date,
                'notes'               => $request->notes,
                'toolbag_id'          => $request->toolbag_id,
                'status'              => 'planned_checkout',
                'notification_emails' => $request->notification_emails ?? [],
            ]);
            $checkin = $planned;
        } else {
            $checkin = Checkin::create([
                'checkin_date'        => $request->checkin_date,
                'notes'               => $request->notes,
                'employee_id'         => $request->employee_id,
                'toolbag_id'          => $request->toolbag_id,
                'status'              => 'planned_checkout',
                'notification_emails' => $request->notification_emails ?? [],
            ]);
        }

        $toolbag->update(['employee_id' => $request->employee_id]);

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

        $request->validate([
            'checkin_date' => 'required|date',
            'notes'        => 'nullable|string',
            'employee_id'  => 'required|exists:employees,id',
            'toolbag_id'   => 'required|exists:toolbags,id',
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $toolbag  = Toolbag::findOrFail($request->toolbag_id);

        if ($employee->role !== $toolbag->type) {
            return back()
                ->withErrors(['toolbag_id' => 'This toolbag is not allowed to check in with this employee.'])
                ->withInput();
        }

        if ($checkin->toolbag_id !== $request->toolbag_id) {
            $oldToolbag = Toolbag::find($checkin->toolbag_id);
            if ($oldToolbag) {
                $oldToolbag->update(['employee_id' => null]);
            }
        }

        $checkin->update([
            'checkin_date' => $request->checkin_date,
            'notes'        => $request->notes,
            'employee_id'  => $request->employee_id,
            'toolbag_id'   => $request->toolbag_id,
        ]);

        $toolbag->update(['employee_id' => $request->employee_id]);

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
            $checkin->toolbag->update(['employee_id' => null]);
        }

        // Send checkout notification emails
        $checkin->load('employee', 'toolbag.tools');
        $missingToolIds = $checkin->missing_tools ?? [];
        $missingTools   = $checkin->toolbag->tools
            ->filter(fn($t) => in_array($t->id, $missingToolIds))
            ->values();
        $totalCost = $missingTools->sum('replacement_cost');

        $recipients = $this->buildRecipients($checkin->notification_emails ?? []);
        foreach ($recipients as $email) {
            Mail::to($email)->send(new CheckoutCompletedMail($checkin, $totalCost));
        }

        return redirect()->route('checkins.index')
            ->with('success', 'Checkout completed.');
    }

    public function checkoutPdf(Checkin $checkin)
    {
        $checkin->load('employee', 'toolbag.tools');

        $missingToolIds = $checkin->missing_tools ?? [];
        $missingTools   = $checkin->toolbag->tools
            ->filter(fn($t) => in_array($t->id, $missingToolIds))
            ->values();
        $totalCost = $missingTools->sum('replacement_cost');

        return Pdf::view('pdf.checkout', [
            'checkin'      => $checkin,
            'employee'     => $checkin->employee,
            'missingTools' => $missingTools,
            'totalCost'    => $totalCost,
        ])
            ->name("checkout-{$checkin->employee->name}.pdf")
            ->inline();
    }

    /**
     * Combine typed-in emails with the fixed company notification email.
     */
    private function buildRecipients(array $typedEmails): array
    {
        $company = config('mail.notification_email');
        $all = array_filter(array_unique(array_merge($typedEmails, $company ? [$company] : [])));
        return array_values($all);
    }
}
