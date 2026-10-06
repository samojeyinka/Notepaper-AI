<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperVersion extends Model
{
    use HasFactory, HasUlids;

    public const UPDATED_AT = null;

    protected $fillable = [
        'paper_id',
        'content',
        'created_at',
    ];

    public function scopeFilter(Builder $query, $filter)
    {
        return $filter->apply($query);
    }

    public function paper(): BelongsTo
    {
        return $this->belongsTo(Paper::class);
    }
}
