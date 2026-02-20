<x-mail::message>
# Check-in completed — {{ $checkin->employee->name }}

A check-in has been completed and a toolbag has been assigned.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $checkin->employee->name }} |
| **Role** | {{ ucfirst($checkin->employee->role) }} |
| **Toolbag** | {{ $checkin->toolbag->name }} |
| **Check-in date** | {{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }} |
@if($checkin->notes)
| **Notes** | {{ $checkin->notes }} |
@endif
</x-mail::table>

## Tools in toolbag

<x-mail::table>
| Brand | Tool | Type | Replacement cost |
|:--|:--|:--|--:|
@foreach($checkin->toolbag->tools as $tool)
| {{ $tool->brand ?? '-' }} | {{ $tool->name }} | {{ $tool->type ?? '-' }} | {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }} |
@endforeach
</x-mail::table>

Thanks,
{{ config('app.name') }}
</x-mail::message>
