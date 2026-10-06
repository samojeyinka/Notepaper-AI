<?php

namespace App\Models;

use App\Enums\StudyPlanActivity;
use App\Enums\StudyPlanStatus;
use App\Enums\WeekDay;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudyPlan extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'exam_date',
        'start_date',
        'study_from',
        'study_to',
        'active_days',
        'enabled_activities',
        'material_ids',
        'status',
        'schedule',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'exam_date'          => 'date',
            'start_date'         => 'date',
            'active_days'        => AsEnumCollection::of(WeekDay::class),
            'enabled_activities' => AsEnumCollection::of(StudyPlanActivity::class),
            'material_ids'       => 'array',
            'schedule'           => 'array',
            'status'             => StudyPlanStatus::class,
            'generated_at'       => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
