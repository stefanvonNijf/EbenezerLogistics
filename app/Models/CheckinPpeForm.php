<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CheckinPpeForm extends Model
{
    protected $fillable = ['checkin_id', 'notes'];

    public function checkin()
    {
        return $this->belongsTo(Checkin::class);
    }
}
