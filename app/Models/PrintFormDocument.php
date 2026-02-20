<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrintFormDocument extends Model
{
    protected $fillable = [
        'name',
        'file_path',
        'uploaded_by',
    ];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
