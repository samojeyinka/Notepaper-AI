<?php

namespace App\Models;

use App\Enums\FontStyle;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paper extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'folder_id',
        'title',
        'content',
        'font_style',
        'text_color',
        'is_pinned',
        'ai_generating',
    ];

    protected function casts(): array
    {
        return [
            'font_style'    => FontStyle::class,
            'is_pinned'     => 'boolean',
            'ai_generating' => 'boolean',
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

    protected $touches = ['folder'];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function paperVersions(): HasMany
    {
        return $this->hasMany(PaperVersion::class);
    }

    public function presentations(): HasMany
    {
        return $this->hasMany(Presentation::class);
    }
}
