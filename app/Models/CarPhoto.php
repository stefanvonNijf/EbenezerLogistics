<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class CarPhoto extends Model
{
    protected $fillable = ['car_id', 'path'];

    public function getUrlAttribute(): string
    {
        return Storage::disk('s3')->url($this->path);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
