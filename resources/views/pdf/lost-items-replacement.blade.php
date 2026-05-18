<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Tool Replacement — {{ $employee->name }}</title>

    <style>
        @page {
            margin: 15mm 12mm 15mm 12mm;
        }

        body {
            font-family: sans-serif;
            font-size: 12px;
            margin: 0;
        }

        h1, h2 {
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        td, th {
            padding: 6px;
            border-bottom: 1px solid #ddd;
        }

        th {
            text-align: left;
            font-weight: bold;
        }

        .label {
            font-weight: bold;
            width: 30%;
        }

        .signature {
            margin-top: 40px;
        }

        .signature-line {
            margin-top: 60px;
        }

        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>

<div style="margin-bottom: 20px;">
    <img src="{{ public_path('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 70px;">
</div>

<h1>Tool Replacement — {{ $employee->name }}</h1>

<table>
    <tr>
        <td class="label">Employee</td>
        <td>{{ $employee->name }}</td>
    </tr>
    <tr>
        <td class="label">Date</td>
        <td>{{ $date }}</td>
    </tr>
    @if($checkin->toolbag)
        <tr>
            <td class="label">Toolbag</td>
            <td>{{ $checkin->toolbag->name }}</td>
        </tr>
    @endif
</table>

<h2>Replaced tools</h2>

<table>
    <thead>
    <tr>
        <th>Tool</th>
        <th>Brand</th>
        <th>Type</th>
        <th class="text-right">Replacement cost</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($tools as $tool)
        <tr>
            <td>{{ $tool->name }}</td>
            <td>{{ $tool->brand ?? '-' }}</td>
            <td>{{ $tool->type ?? '-' }}</td>
            <td class="text-right">
                {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }}
            </td>
        </tr>
    @endforeach
    </tbody>
</table>

<p style="font-size: 11px; color: #374151;">
    By signing below, the employee confirms receipt of the replacement tool(s) listed above.
</p>

<div class="signature">
    <table>
        <tr>
            <td>Signature {{ $employee->name }}:</td>
            <td>
                @if(!empty($employeeSignature))
                    <img src="{{ $employeeSignature }}" style="height: 55px; max-width: 220px; display: block;">
                @else
                    <span class="signature-line">__________________________</span>
                @endif
            </td>
        </tr>
        <tr>
            <td>Signature person in charge:</td>
            <td>
                @if(!empty($managerSignature))
                    <img src="{{ $managerSignature }}" style="height: 55px; max-width: 220px; display: block;">
                @else
                    <span class="signature-line">__________________________</span>
                @endif
            </td>
        </tr>
    </table>
</div>

</body>
</html>
