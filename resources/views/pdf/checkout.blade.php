<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Checkout Report — {{ $employee->name }}</title>

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

        .total-row td {
            font-weight: bold;
            border-top: 2px solid #333;
            border-bottom: none;
        }

        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>

<h1>Checkout Report — {{ $employee->name }}</h1>

<table>
    <tr>
        <td class="label">Employee</td>
        <td>{{ $employee->name }}</td>
    </tr>
    <tr>
        <td class="label">Check-in date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }}</td>
    </tr>
    <tr>
        <td class="label">Checkout date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkout_date)->format('d-m-Y') }}</td>
    </tr>
    @if($checkin->toolbag)
        <tr>
            <td class="label">Toolbag</td>
            <td>{{ $checkin->toolbag->name }}</td>
        </tr>
    @endif
</table>

@if($missingTools->isEmpty())
    <p style="font-size: 14px; font-weight: bold; color: #16a34a;">
        &#10003; All tools have been returned. No missing items.
    </p>
@else
    <h2>Missing tools</h2>

    <table>
        <thead>
        <tr>
            <th>Brand</th>
            <th>Tool</th>
            <th>Type</th>
            <th class="text-right">Replacement cost</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($missingTools as $tool)
            <tr>
                <td>{{ $tool->brand ?? '-' }}</td>
                <td>{{ $tool->name }}</td>
                <td>{{ $tool->type ?? '-' }}</td>
                <td class="text-right">
                    {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }}
                </td>
            </tr>
        @endforeach
        </tbody>
        <tfoot>
        <tr class="total-row">
            <td colspan="3" class="text-right">Total replacement cost:</td>
            <td class="text-right">€ {{ number_format($totalCost, 2) }}</td>
        </tr>
        </tfoot>
    </table>
@endif

<div class="signature">
    <table>
        <tr>
            <td>Signature {{ $employee->name }}:</td>
            <td class="signature-line">__________________________</td>
        </tr>
        <tr>
            <td>Signature person in charge:</td>
            <td class="signature-line">__________________________</td>
        </tr>
    </table>
</div>

</body>
</html>
