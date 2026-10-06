<?php

namespace App\Models;

use App\Enums\PresentationTheme;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Presentation extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'paper_id',
        'title',
        'slides',
        'theme',
        'slide_count',
    ];

    protected function casts(): array
    {
        return [
            'theme'       => PresentationTheme::class,
            'slide_count' => 'integer',
        ];
    }

    public function scopeFilter(Builder $query, $filter)
    {
        return $filter->apply($query);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
