<?php

namespace App\Models;

use App\Enums\QuizDifficulty;
use App\Enums\QuizQuestionType;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'subject',
        'difficulty',
        'question_type',
        'question_count',
        'questions',
    ];

    protected function casts(): array
    {
        return [
            'difficulty'     => QuizDifficulty::class,
            'question_type'  => QuizQuestionType::class,
            'questions'      => 'array',
            'question_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
