<?php

namespace App\Models;

use App\Enums\UserModerationsStatus;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserModeration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'requested_by',
        'reviewed_by',
        'reason',
        'status',
    ];

    protected $hidden = [];

    public function casts(): array
    {
        return [
            'status'     => UserModerationsStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public static function bulkUpdateStatus(Collection $moderations, UserModerationsStatus $status): void
    {
        $userStatus = $status === UserModerationsStatus::APPROVED
            ? UserStatus::SUSPENDED->value
            : UserStatus::ACTIVE->value;

        DB::transaction(function () use ($moderations, $status, $userStatus) {

            $ids = $moderations->pluck('id');
            $userIds = $moderations->pluck('user_id');

            static::whereIn('id', $ids)->update([
                'status' => $status,
            ]);

            User::whereIn('id', $userIds)->update([
                'status' => $userStatus,
            ]);
        });
    }
}
