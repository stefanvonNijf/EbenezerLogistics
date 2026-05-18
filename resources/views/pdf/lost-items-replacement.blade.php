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

        .arrow {
            color: #6b7280;
            font-size: 14px;
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
        <th>Lost / Broken tool</th>
        <th></th>
        <th>Replacement tool</th>
        <th>Replacement cost</th>
    </tr>
    </thead>
    <tbody>
    @foreach ($replacements as $item)
        @php
            $old = $oldTools[$item['old_tool_id']] ?? null;
            $new = $newTools[$item['new_tool_id']] ?? null;
        @endphp
        <tr>
            <td>
                @if($old)
                    {{ $old->name }}
                    @if($old->brand) <span style="color:#6b7280;">({{ $old->brand }})</span> @endif
                @else
                    —
                @endif
            </td>
            <td class="arrow">→</td>
            <td>
                @if($new)
                    {{ $new->name }}
                    @if($new->brand) <span style="color:#6b7280;">({{ $new->brand }})</span> @endif
                @else
                    —
                @endif
            </td>
            <td>
                {{ $new?->replacement_cost ? '€ ' . number_format($new->replacement_cost, 2) : '-' }}
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
