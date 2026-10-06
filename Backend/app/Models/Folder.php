<?php

namespace App\Models;

use App\Enums\ShapeEnum;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'icon',
        'shape',
    ];

    protected $hidden = [];

    public function scopeFilter(Builder $query, $filter)
    {
        return $filter->apply($query);
    }

    protected function casts(): array
    {
        return [
            'shape' => ShapeEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function papers(): HasMany
    {
        return $this->hasMany(Paper::class);
    }

    public function flashcards(): HasMany
    {
        return $this->hasMany(Flashcard::class);
    }
}
