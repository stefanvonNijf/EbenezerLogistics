<x-mail::message>
<img src="{{ asset('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 80px; display: block; margin-bottom: 16px;">

# Checkout planned — {{ $employee->name }}

A checkout has been planned for the following employee.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $employee->name }} |
| **Role** | {{ ucfirst($employee->role) }} |
| **Planned checkout date** | {{ \Carbon\Carbon::parse($checkin->planned_checkout_date)->format('d-m-Y') }} |
@if($checkin->notes)
| **Notes** | {{ $checkin->notes }} |
@endif
</x-mail::table>

Thanks,
{{ config('app.name') }}
</x-mail::message>
