<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'type',
        'category_id',
        'roletype',
        'amount_in_stock',
        'minimal_stock',
        'replacement_cost',
        'image_path',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) return null;
        return Storage::disk('s3')->url($this->image_path);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function toolbags()
    {
        return $this->belongsToMany(Toolbag::class, 'toolbag_tools')
            ->withPivot('amount_in_bag')
            ->withTimestamps();
    }
}
