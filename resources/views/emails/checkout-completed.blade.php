<x-mail::message>
# Checkout completed — {{ $checkin->employee->name }}

A checkout has been completed.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $checkin->employee->name }} |
| **Toolbag** | {{ $checkin->toolbag->name ?? '-' }} |
| **Check-in date** | {{ \Carbon\Carbon::parse($checkin->checkin_date)->format('d-m-Y') }} |
| **Checkout date** | {{ \Carbon\Carbon::parse($checkin->checkout_date)->format('d-m-Y') }} |
</x-mail::table>

@php
    $missingToolIds = $checkin->missing_tools ?? [];
    $missingTools = $checkin->toolbag?->tools->filter(fn($t) => in_array($t->id, $missingToolIds))->values() ?? collect();
@endphp

@if($missingTools->isEmpty())
**All tools have been returned. No missing items.**
@else
## Missing tools

<x-mail::table>
| Brand | Tool | Type | Replacement cost |
|:--|:--|:--|--:|
@foreach($missingTools as $tool)
| {{ $tool->brand ?? '-' }} | {{ $tool->name }} | {{ $tool->type ?? '-' }} | {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }} |
@endforeach
| | | **Total** | **€ {{ number_format($totalMissingCost, 2) }}** |
</x-mail::table>
@endif

Thanks,
{{ config('app.name') }}
</x-mail::message>
