<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PbmItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pbm_category_id',
        'size',
        'amount_in_stock',
        'minimal_stock',
        'replacement_cost',
    ];

    public function category()
    {
        return $this->belongsTo(PbmCategory::class, 'pbm_category_id');
    }
}
