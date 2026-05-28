<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ToolboxTemplate extends Model
{
    protected $fillable = ['name', 'file_path', 'uploaded_by'];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function checkins()
    {
        return $this->hasMany(Checkin::class);
    }
}
