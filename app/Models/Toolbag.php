<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Toolbag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'notes',
        'type',
        'complete',
        'employee_id',
    ];
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function tools()
    {
        return $this->belongsToMany(Tool::class, 'toolbag_tools')
            ->withPivot('amount_in_bag')
            ->withTimestamps();
    }
}
