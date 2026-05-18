<x-mail::message>
<img src="{{ asset('images/ebenezer-logo.png') }}" alt="Ebenezer Logistics" style="max-height: 80px; display: block; margin-bottom: 16px;">

# Tool replacement — {{ $checkin->employee->name }}

Replacement tools have been issued and signed for.

<x-mail::table>
| | |
|:--|:--|
| **Employee** | {{ $checkin->employee->name }} |
| **Toolbag** | {{ $checkin->toolbag->name ?? '-' }} |
| **Date** | {{ now()->format('d-m-Y') }} |
</x-mail::table>

## Replaced tools

<x-mail::table>
| Tool | Brand | Type | Replacement cost |
|:--|:--|:--|--:|
@foreach($tools as $tool)
| {{ $tool->name }} | {{ $tool->brand ?? '-' }} | {{ $tool->type ?? '-' }} | {{ $tool->replacement_cost ? '€ ' . number_format($tool->replacement_cost, 2) : '-' }} |
@endforeach
</x-mail::table>

The signed replacement document is attached to this email.

Thanks,
{{ config('app.name') }}
</x-mail::message>
