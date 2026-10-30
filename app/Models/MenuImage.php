<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuImage extends Model
{
    protected $fillable = [
        'side',
        'image_path',
    ];
}
