<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Check-in {{ $employee->name }}</title>

    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
        }

        h1, h2 {
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
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
    </style>
</head>
<body>

<h1>Check-in {{ $employee->name }}</h1>

<table>
    <tr>
        <td class="label">Date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }}</td> </tr>
    <tr>
        <td class="label">Employee</td>
        <td>{{ $employee->name }}</td>
    </tr>

    <tr>
        <td class="label">Toolbag</td>
        <td>{{ $toolbag->name }}</td>
    </tr>

    @if($checkin->notes)
        <tr>
            <td class="label">Notes</td>
            <td>{{ $checkin->notes }}</td>
        </tr>
    @endif
</table>

<h2>Tools in this toolbag</h2>

<table>
    <thead>
    <tr>
        <td class="label">Image</td>
        <td class="label">Brand</td>
        <td class="label">Tool</td>
        <td class="label">Type</td>
        <td class="label">Replacement Cost</td>
        <td class="label" style="text-align:center;">Check-in</td>
        <td class="label" style="text-align:center;">Check-out</td>
    </tr>
    </thead>
    <tbody>
    @foreach ($tools as $tool)
        <tr>
            <td style="text-align:center;">
                @if($tool->image_path)
                    <img src="{{ public_path('storage/' . $tool->image_path) }}"
                         alt="{{ $tool->name }}"
                         style="width: 150px; height: auto;">
                @else
                    -
                @endif
            </td>
            <td>{{ $tool->brand ?? '-' }}</td>
            <td>{{ $tool->name }}</td>
            <td>{{ $tool->type ?? '-' }}</td>
            <td>&euro; {{ $tool->replacement_cost ? number_format($tool->replacement_cost, 2) : '-' }}</td>
            <td style="text-align:center;">
                <input type="checkbox">
            </td>
            <td style="text-align:center;">
                <input type="checkbox">
            </td>
        </tr>
    @endforeach
    </tbody>
</table>


@if($checkin->notes)
    <p style="font-size: 12px;">
         {{ $checkin->notes }}
    </p>
@endif
<p style="font-size: 12px;">
    By signing below, the employee confirms receipt of the above tools in good condition.
</p>

<div class="signature">
    <table>
        <tr>
            <td>Signature {{ $employee->name }}: </td>
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
