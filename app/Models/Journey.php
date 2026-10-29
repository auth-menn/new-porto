<?php

namespace App\Models;

use Database\Factories\JourneyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journey extends Model
{
    /** @use HasFactory<JourneyFactory> */
    use HasFactory;

    protected $fillable = [
        'category',
        'organization',
        'title',
        'logo_path',
        'start_year',
        'end_year',
        'activities',
        'documentation_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['activities' => 'array'];
    }
}
