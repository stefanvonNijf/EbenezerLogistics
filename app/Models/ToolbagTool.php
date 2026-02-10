<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ToolbagTool extends Pivot
{
    protected $table = 'toolbag_tools';

    protected $fillable = [
        'toolbag_id',
        'tool_id',
        'amount_in_bag',
    ];

    public function toolbag()
    {
        return $this->belongsTo(Toolbag::class);
    }

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }
}
