<x-mail::message>
<img src="{{ asset('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 80px; display: block; margin-bottom: 16px;">

# Check-in completed — {{ $checkin->employee->name }}

A check-in has been completed.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $checkin->employee->name }} |
| **Role** | {{ ucfirst($checkin->employee->role) }} |
@if($checkin->car)
| **Car** | {{ $checkin->car->brand }} — {{ $checkin->car->license_plate }} |
@if($checkin->checkin_mileage !== null)
| **Mileage at check-in** | {{ number_format($checkin->checkin_mileage) }} km |
@endif
@elseif($checkin->toolbag)
| **Toolbag** | {{ $checkin->toolbag->name }} |
@elseif($checkin->custom_items)
| **Items** | Custom ({{ count($checkin->custom_items) }} items) |
@endif
| **Check-in date** | {{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }} |
@if($checkin->notes)
| **Notes** | {{ $checkin->notes }} |
@endif
</x-mail::table>

@if($checkin->toolbag && $checkin->toolbag->tools->count())
## Tools in toolbag

<x-mail::table>
| Brand | Tool | Type | Replacement cost |
|:--|:--|:--|--:|
@foreach($checkin->toolbag->tools as $tool)
| {{ $tool->brand ?? '-' }} | {{ $tool->name }} | {{ $tool->type ?? '-' }} | {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }} |
@endforeach
</x-mail::table>
@endif

@if($checkin->custom_items)
## Items

<x-mail::table>
| Item | Replacement cost |
|:--|--:|
@foreach($checkin->custom_items as $item)
| {{ $item['name'] }} | {{ isset($item['replacement_cost']) && $item['replacement_cost'] ? '€ ' . number_format($item['replacement_cost'], 2) : '-' }} |
@endforeach
</x-mail::table>
@endif

@if($checkin->documents && $checkin->documents->count())
## Attached documents

<x-mail::table>
| Document |
|:--|
@foreach($checkin->documents as $document)
| {{ $document->name }} |
@endforeach
</x-mail::table>
@endif

Thanks,
{{ config('app.name') }}
</x-mail::message>
