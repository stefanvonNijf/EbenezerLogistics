<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = ['tool_id', 'amount'];

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}
