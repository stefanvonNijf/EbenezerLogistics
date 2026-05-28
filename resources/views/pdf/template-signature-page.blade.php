<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Signature — {{ $template->name }}</title>
    <style>
        @page { margin: 15mm 12mm 15mm 12mm; }
        body { font-family: sans-serif; font-size: 12px; margin: 0; }
        h1 { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; width: 30%; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>

<div style="margin-bottom: 20px;">
    <img src="{{ public_path('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 70px;">
</div>

<h1>Signature Page — {{ $template->name }}</h1>

<table>
    <tr>
        <td class="label">Date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }}</td>
    </tr>
    <tr>
        <td class="label">Employee</td>
        <td>{{ $employee->name }}</td>
    </tr>
    <tr>
        <td class="label">Template</td>
        <td>{{ $template->name }}</td>
    </tr>
    @if($checkin->notes)
    <tr>
        <td class="label">Notes</td>
        <td>{{ $checkin->notes }}</td>
    </tr>
    @endif
</table>

<p style="font-size: 12px;">
    By signing below, the employee confirms receipt and acknowledgement of the above document.
</p>

<div class="signature">
    <table>
        <tr>
            <td style="width: 40%;">Signature {{ $employee->name }}:</td>
            <td>
                @if(!empty($employeeSignature))
                    <img src="{{ $employeeSignature }}" style="height: 55px; max-width: 220px; display: block;">
                @else
                    <span style="display:inline-block; margin-top: 50px;">__________________________</span>
                @endif
            </td>
        </tr>
        <tr>
            <td>Signature person in charge:</td>
            <td>
                @if(!empty($managerSignature))
                    <img src="{{ $managerSignature }}" style="height: 55px; max-width: 220px; display: block;">
                @else
                    <span style="display:inline-block; margin-top: 50px;">__________________________</span>
                @endif
            </td>
        </tr>
    </table>
</div>

</body>
</html>
