<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'category_id'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function toolbags()
    {
        return $this->belongsToMany(Toolbag::class, 'toolbag_tools')
            ->withPivot('amount_in_bag')
            ->withTimestamps();
    }
}
