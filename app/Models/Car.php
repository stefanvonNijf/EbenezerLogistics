<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Car extends Model
{
    use HasFactory;

    protected $fillable = ['brand', 'license_plate', 'employee_id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
