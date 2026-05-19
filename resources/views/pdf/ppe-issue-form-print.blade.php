<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PPE Issue Form - {{ $employee->name ?? 'Employee' }}</title>

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

        td, th {
            padding: 8px;
            border: 1px solid #ddd;
        }

        th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: left;
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

        .header-section {
            margin-bottom: 30px;
        }

        .checkbox-cell {
            text-align: center;
            width: 80px;
        }
    </style>
</head>
<body>

<div style="margin-bottom: 20px;">
    <img src="{{ public_path('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 70px;">
</div>

<h1>PPE Issue Form</h1>

<div class="header-section">
    <table>
        <tr>
            <td class="label">Employee's name:</td>
            <td>{{ $employee->name ?? '___________________________________' }}</td>
        </tr>
        <tr>
            <td class="label">Date of admission:</td>
            <td>{{ isset($admission_date) ? \Carbon\Carbon::parse($admission_date)->format('d-m-Y') : '___________________________________' }}</td>
        </tr>
        <tr>
            <td class="label">Professional Category:</td>
            <td>{{ $professional_category ?? '___________________________________' }}</td>
        </tr>
    </table>
</div>

<h2>ISSUED PPE</h2>

<table>
    <thead>
        <tr>
            <th>DESCRIPTION</th>
            <th class="checkbox-cell">QUANT.</th>
            <th class="checkbox-cell">SIZE</th>
            <th>NOTES</th>
        </tr>
    </thead>
    @php
        $selectedOnly = $selectedOnly ?? false;
        $ppeRows = [
            ['key' => 'goggles',      'label' => 'GOGGLES'],
            ['key' => 'gloves',       'label' => 'GLOVES'],
            ['key' => 'rain_jacket',  'label' => 'RAIN JACKET'],
            ['key' => 'inner_jacket', 'label' => 'INNER JACKET (Lining)'],
            ['key' => 'rain_pants',   'label' => 'RAIN PANTS'],
            ['key' => 'overalls',     'label' => 'OVERALLS'],
            ['key' => 'boots',        'label' => 'BOOTS'],
            ['key' => 'helmet',       'label' => 'HELMET'],
        ];
    @endphp
    <tbody>
        @foreach($ppeRows as $row)
            @if(!$selectedOnly || isset($ppe[$row['key']]))
            <tr>
                <td>{{ $row['label'] }}</td>
                <td class="checkbox-cell">{{ $ppe[$row['key']]['quantity'] ?? '1' }}</td>
                <td class="checkbox-cell">{{ $ppe[$row['key']]['size'] ?? '' }}</td>
                <td>{{ $ppe[$row['key']]['notes'] ?? '' }}</td>
            </tr>
            @endif
        @endforeach
    </tbody>
</table>

@if(!empty($notes))
    <p><strong>Notes:</strong> {{ $notes }}</p>
@endif

<p style="font-size: 12px;">
    By signing below, the employee confirms receipt of the above PPE items in good condition.
</p>

<div class="signature">
    <table>
        <tr>
            <td>Employee signature:</td>
            <td class="signature-line">__________________________</td>
        </tr>
        <tr>
            <td>Person in charge:</td>
            <td class="signature-line">__________________________</td>
        </tr>
    </table>
</div>

</body>
</html>
