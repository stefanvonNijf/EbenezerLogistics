<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checkin extends Model
{
    protected $fillable = [
        'checkin_date',
        'checkout_date',
        'planned_checkout_date',
        'notes',
        'status',
        'contract_exported_at',
        'missing_tools',
        'notification_emails',
        'employee_id',
        'toolbag_id',
    ];

    protected $casts = [
        'contract_exported_at' => 'datetime',
        'missing_tools'        => 'array',
        'notification_emails'  => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function toolbag()
    {
        return $this->belongsTo(Toolbag::class);
    }
}
