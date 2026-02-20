<x-mail::message>
# Checkin planned — {{ $employee->name }}

A checkin has been planned for the following employee.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $employee->name }} |
| **Role** | {{ ucfirst($employee->role) }} |
| **Planned date** | {{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }} |
@if($checkin->notes)
| **Notes** | {{ $checkin->notes }} |
@endif
</x-mail::table>

Thanks,
{{ config('app.name') }}
</x-mail::message>
