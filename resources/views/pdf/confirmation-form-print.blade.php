<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Confirmation Form</title>

    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
            padding: 40px;
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
            margin-top: 60px;
        }

        .signature-line {
            margin-top: 60px;
            border-bottom: 1px solid #000;
            width: 400px;
        }

        .date-field {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
        }
    </style>
</head>
<body>

<h1>Confirmation Form</h1>

<table>
    <tr>
        <td class="label">Date:</td>
        <td>
            @if(isset($date))
                {{ \Carbon\Carbon::parse($date)->format('d-m-Y') }}
            @else
                <span class="date-field">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            @endif
        </td>
    </tr>
</table>

<div class="signature">
    <table>
        <tr>
            <td>Signature:</td>
            <td class="signature-line">__________________________________________________________________</td>
        </tr>
    </table>
</div>

<div class="signature">
    <table>
        <tr>
            <td>Signature of the person in charge:</td>
            <td class="signature-line">__________________________</td>
        </tr>
    </table>
</div>

</body>
</html>
