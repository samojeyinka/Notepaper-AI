<?php

namespace App\Models;

use App\Enums\SprintChallengeStatus;
use App\Enums\SprintChallengeType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SprintChallenge extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'sprint_id',
        'title',
        'description',
        'type',
        'content',
        'status',
        'challenge_order',
        'scheduled_at',
        'completed_at',
        'reminder_30_sent_at',
        'reminder_10_sent_at',
        'post_reminder_count',
        'last_post_reminder_at',
    ];

    protected function casts(): array
    {
        return [
            'content'               => 'array',
            'status'                => SprintChallengeStatus::class,
            'type'                  => SprintChallengeType::class,
            'scheduled_at'          => 'datetime',
            'completed_at'          => 'datetime',
            'reminder_30_sent_at'   => 'datetime',
            'reminder_10_sent_at'   => 'datetime',
            'last_post_reminder_at' => 'datetime',
            'challenge_order'       => 'integer',
            'post_reminder_count'   => 'integer',
        ];
    }

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }
}
