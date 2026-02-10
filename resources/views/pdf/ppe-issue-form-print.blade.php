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
    <tbody>
        <tr>
            <td>GOGGLES</td>
            <td class="checkbox-cell">{{ $ppe['goggles']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['goggles']['size'] ?? '' }}</td>
            <td>{{ $ppe['goggles']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>GLOVES</td>
            <td class="checkbox-cell">{{ $ppe['gloves']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['gloves']['size'] ?? '' }}</td>
            <td>{{ $ppe['gloves']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>RAIN JACKET</td>
            <td class="checkbox-cell">{{ $ppe['rain_jacket']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['rain_jacket']['size'] ?? '' }}</td>
            <td>{{ $ppe['rain_jacket']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>INNER JACKET (Lining)</td>
            <td class="checkbox-cell">{{ $ppe['inner_jacket']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['inner_jacket']['size'] ?? '' }}</td>
            <td>{{ $ppe['inner_jacket']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>RAIN PANTS</td>
            <td class="checkbox-cell">{{ $ppe['rain_pants']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['rain_pants']['size'] ?? '' }}</td>
            <td>{{ $ppe['rain_pants']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>OVERALLS</td>
            <td class="checkbox-cell">{{ $ppe['overalls']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['overalls']['size'] ?? '' }}</td>
            <td>{{ $ppe['overalls']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>BOOTS</td>
            <td class="checkbox-cell">{{ $ppe['boots']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['boots']['size'] ?? '' }}</td>
            <td>{{ $ppe['boots']['notes'] ?? '' }}</td>
        </tr>
        <tr>
            <td>HELMET</td>
            <td class="checkbox-cell">{{ $ppe['helmet']['quantity'] ?? '1' }}</td>
            <td class="checkbox-cell">{{ $ppe['helmet']['size'] ?? '' }}</td>
            <td>{{ $ppe['helmet']['notes'] ?? '' }}</td>
        </tr>
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
