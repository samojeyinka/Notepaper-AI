<?php

namespace App\Services;

use App\Enums\QuizDifficulty;
use App\Enums\QuizQuestionType;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class QuizService
{
    public function list(User $user, string $sortBy = 'created_at', string $sortDir = 'desc', ?string $searching = null): LengthAwarePaginator
    {
        return Quiz::where('user_id', $user->id)
            ->when($searching, fn ($q) => $q->where('title', 'like', "%{$searching}%"))
            ->orderBy($sortBy, $sortDir)
            ->paginate(20);
    }

    public function create(User $user, array $data): Quiz
    {
        return Quiz::create([
            'user_id'        => $user->id,
            'title'          => $data['title'] ?? 'Untitled Quiz',
            'subject'        => $data['subject'] ?? 'auto',
            'difficulty'     => $data['difficulty'] ?? QuizDifficulty::Medium->value,
            'question_type'  => $data['question_type'] ?? QuizQuestionType::Multiple->value,
            'question_count' => $data['question_count'] ?? count($data['questions'] ?? []),
            'questions'      => $data['questions'] ?? [],
        ]);
    }

    public function show(string $id, User $user): Quiz
    {
        return Quiz::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    public function findPublic(string $id): Quiz
    {
        return Quiz::findOrFail($id);
    }

    public function delete(Quiz $quiz): void
    {
        $quiz->delete();
    }
}
