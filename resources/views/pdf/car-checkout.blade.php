<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Car Checkout Report — {{ $employee->name }}</title>

    <style>
        @page { margin: 15mm 12mm 15mm 12mm; }
        body { font-family: sans-serif; font-size: 12px; margin: 0; }
        h1, h2 { margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        td, th { padding: 6px; border-bottom: 1px solid #ddd; }
        th { text-align: left; font-weight: bold; }
        .label { font-weight: bold; width: 30%; }
        .signature { margin-top: 40px; }
        .signature-line { margin-top: 60px; }
    </style>
</head>
<body>

<div style="margin-bottom: 20px;">
    <img src="{{ public_path('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 70px;">
</div>

<h1>Car Checkout Report — {{ $employee->name }}</h1>

<table>
    <tr>
        <td class="label">Employee</td>
        <td>{{ $employee->name }}</td>
    </tr>
    <tr>
        <td class="label">Car</td>
        <td>{{ $car->brand }} — {{ $car->license_plate }}</td>
    </tr>
    <tr>
        <td class="label">Check-in date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }}</td>
    </tr>
    <tr>
        <td class="label">Checkout date</td>
        <td>{{ \Carbon\Carbon::parse($checkin->checkout_date)->format('d-m-Y') }}</td>
    </tr>
    @if($checkin->checkin_mileage !== null)
        <tr>
            <td class="label">Mileage at check-in</td>
            <td>{{ number_format($checkin->checkin_mileage) }} km</td>
        </tr>
    @endif
    @if($checkin->checkout_mileage !== null)
        <tr>
            <td class="label">Mileage at checkout</td>
            <td>{{ number_format($checkin->checkout_mileage) }} km</td>
        </tr>
    @endif
    @if($checkin->checkin_mileage !== null && $checkin->checkout_mileage !== null)
        <tr>
            <td class="label">Distance driven</td>
            <td>{{ number_format($checkin->checkout_mileage - $checkin->checkin_mileage) }} km</td>
        </tr>
    @endif
</table>

<p style="font-size: 12px; font-weight: bold; color: #16a34a;">
    &#10003; Vehicle returned.
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
