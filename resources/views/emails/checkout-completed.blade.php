<x-mail::message>
<img src="{{ asset('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 80px; display: block; margin-bottom: 16px;">

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
    $checkoutMissingItems = $checkin->checkout_missing_items ?? [];
    $hasAnyMissing = $missingTools->isNotEmpty() || !empty($checkoutMissingItems);
@endphp

@if(!$hasAnyMissing)
**All items have been returned. No missing items.**
@else

@if($missingTools->isNotEmpty())
## Missing tools

<x-mail::table>
| Brand | Tool | Type | Replacement cost |
|:--|:--|:--|--:|
@foreach($missingTools as $tool)
| {{ $tool->brand ?? '-' }} | {{ $tool->name }} | {{ $tool->type ?? '-' }} | {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }} |
@endforeach
</x-mail::table>
@endif

@if(!empty($checkoutMissingItems))
## Missing items

<x-mail::table>
| Item | Replacement cost |
|:--|--:|
@foreach($checkoutMissingItems as $item)
| {{ $item['name'] }} | {{ isset($item['replacement_cost']) && $item['replacement_cost'] !== null ? '€ ' . number_format((float)$item['replacement_cost'], 2) : '-' }} |
@endforeach
</x-mail::table>
@endif

**Total replacement cost: € {{ number_format($totalMissingCost, 2) }}**

@endif

Thanks,
{{ config('app.name') }}
</x-mail::message>
