<?php

namespace App\Models;

use App\Enums\SprintStatus;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sprint extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'goal',
        'start_date',
        'end_date',
        'material_ids',
        'material_uploads',
        'status',
        'challenges_count',
        'challenges_filled',
    ];

    protected function casts(): array
    {
        return [
            'start_date'        => 'date',
            'end_date'          => 'date',
            'material_ids'      => 'array',
            'material_uploads'  => 'array',
            'status'            => SprintStatus::class,
            'challenges_count'  => 'integer',
            'challenges_filled' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function challenges(): HasMany
    {
        return $this->hasMany(SprintChallenge::class)->orderBy('challenge_order');
    }
}
