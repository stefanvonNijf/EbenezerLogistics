<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'role'];

    public function toolbag()
    {
        return $this->hasOne(Toolbag::class);
    }

    public function car()
    {
        return $this->hasOne(Car::class);
    }

    public function checkins()
    {
        return $this->hasMany(Checkin::class);
    }
}
