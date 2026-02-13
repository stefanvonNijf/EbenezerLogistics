<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checkin extends Model
{
    protected $fillable = [
        'checkin_date',
        'checkout_date',
        'notes',
        'status',
        'employee_id',
        'toolbag_id',
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
