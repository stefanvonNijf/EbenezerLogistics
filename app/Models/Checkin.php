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
        'custom_items',
        'employee_checkin_signature',
        'manager_checkin_signature',
        'employee_checkout_signature',
        'manager_checkout_signature',
        'signed_checkin_pdf_path',
        'signed_checkout_pdf_path',
        'car_id',
        'checkin_mileage',
        'checkout_mileage',
    ];

    protected $casts = [
        'contract_exported_at' => 'datetime',
        'missing_tools'        => 'array',
        'notification_emails'  => 'array',
        'custom_items'         => 'array',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function toolbag()
    {
        return $this->belongsTo(Toolbag::class);
    }

    public function car()
    {
        return $this->belongsTo(\App\Models\Car::class);
    }

    public function ppeForms()
    {
        return $this->hasMany(CheckinPpeForm::class);
    }

    public function documents()
    {
        return $this->belongsToMany(PrintFormDocument::class, 'checkin_print_form_document');
    }

    public function replacements()
    {
        return $this->hasMany(CheckinReplacement::class);
    }
}
