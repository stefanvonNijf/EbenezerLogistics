<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckinReplacement extends Model
{
    protected $fillable = [
        'checkin_id',
        'replaced_tools',
        'custom_items',
        'employee_signature',
        'manager_signature',
        'pdf_path',
    ];

    protected $casts = [
        'replaced_tools' => 'array',
        'custom_items'   => 'array',
    ];

    public function checkin()
    {
        return $this->belongsTo(Checkin::class);
    }
}
