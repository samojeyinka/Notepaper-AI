<?php

namespace Tests\Feature;

use App\Enums\PresentationTheme;
use App\Enums\QuizDifficulty;
use App\Enums\QuizQuestionType;
use App\Enums\StudyPlanActivity;
use App\Enums\StudyPlanStatus;
use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\WeekDay;
use App\Models\Presentation;
use App\Models\Quiz;
use App\Models\StudyPlan;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class EnumCastsTest extends TestCase
{
    use RefreshDatabase;

    public function test_quiz_enum_columns_are_cast_and_serialize_to_values(): void
    {
        $user = User::factory()->create();

        $quiz = Quiz::create([
            'user_id'       => $user->id,
            'title'         => 'Physics Quiz',
            'difficulty'    => 'easy',
            'question_type' => 'multiple_choice',
            'questions'     => [
                ['question' => 'q1', 'options' => ['a', 'b'], 'correct_index' => 0, 'explanation' => 'e'],
            ],
        ]);

        $this->assertInstanceOf(QuizDifficulty::class, $quiz->difficulty);
        $this->assertSame(QuizDifficulty::Easy, $quiz->difficulty);
        $this->assertSame(QuizQuestionType::MultipleChoice, $quiz->question_type);

        $this->assertSame('easy', $quiz->toArray()['difficulty']);
        $this->assertSame('multiple_choice', $quiz->toArray()['question_type']);
    }

    public function test_legacy_quiz_question_type_default_is_accepted(): void
    {
        $user = User::factory()->create();

        $quiz = Quiz::create([
            'user_id'       => $user->id,
            'title'         => 'Legacy Quiz',
            'question_type' => 'multiple',
            'questions'     => [],
        ]);

        $this->assertSame(QuizQuestionType::Multiple, $quiz->question_type);
        $this->assertSame('multiple', $quiz->toArray()['question_type']);
    }

    public function test_ticket_enum_columns_are_cast_and_serialize_to_values(): void
    {
        $user = User::factory()->create();

        $ticket = Ticket::create([
            'user_id'  => $user->id,
            'subject'  => 'Login issue',
            'details'  => 'Cannot sign in',
            'status'   => 'open',
            'priority' => 'high',
            'category' => 'technical_issue',
        ]);

        $this->assertSame(TicketStatus::OPEN, $ticket->status);
        $this->assertSame(TicketPriority::HIGH, $ticket->priority);
        $this->assertSame(TicketCategory::TECHNICAL_ISSUE, $ticket->category);

        $this->assertSame('open', $ticket->toArray()['status']);
        $this->assertSame('high', $ticket->toArray()['priority']);
        $this->assertSame('technical_issue', $ticket->toArray()['category']);
    }

    public function test_study_plan_enum_columns_are_cast_and_serialize_to_values(): void
    {
        $user = User::factory()->create();

        $plan = StudyPlan::create([
            'user_id'            => $user->id,
            'name'               => 'Exams',
            'exam_date'          => now()->addMonth(),
            'start_date'         => now(),
            'active_days'        => ['Mon', 'Wed', 'Fri'],
            'enabled_activities' => ['review', 'flashcard'],
            'material_ids'       => [],
            'status'             => 'pending',
        ]);

        $this->assertInstanceOf(Collection::class, $plan->active_days);
        $this->assertInstanceOf(Collection::class, $plan->enabled_activities);
        $this->assertContainsOnlyInstancesOf(WeekDay::class, $plan->active_days);
        $this->assertContainsOnlyInstancesOf(StudyPlanActivity::class, $plan->enabled_activities);
        $this->assertSame(StudyPlanStatus::Pending, $plan->status);

        $this->assertSame(['Mon', 'Wed', 'Fri'], $plan->toArray()['active_days']);
        $this->assertSame(['review', 'flashcard'], $plan->toArray()['enabled_activities']);
        $this->assertSame('pending', $plan->toArray()['status']);
    }

    public function test_presentation_theme_is_cast_and_serializes_to_value(): void
    {
        $user = User::factory()->create();

        $presentation = Presentation::create([
            'user_id'     => $user->id,
            'title'       => 'Deck',
            'theme'       => 'modern',
            'slide_count' => 5,
        ]);

        $this->assertSame(PresentationTheme::Modern, $presentation->theme);
        $this->assertSame('modern', $presentation->toArray()['theme']);
    }

    public function test_editor_quiz_vocabulary_is_cast_and_keeps_questions_json_plain(): void
    {
        $user = User::factory()->create();

        $quiz = Quiz::create([
            'user_id'       => $user->id,
            'title'         => 'Editor Quiz',
            'question_type' => 'both',
            'questions'     => [
                ['type' => 'multiple', 'question' => 'q1', 'options' => ['a', 'b'], 'correct' => 0],
                ['type' => 'input', 'question' => 'q2', 'options' => [], 'correct' => 'ok'],
            ],
        ]);

        $this->assertSame(QuizQuestionType::Both, $quiz->question_type);
        $this->assertSame('both', $quiz->toArray()['question_type']);
        $this->assertSame('multiple', $quiz->toArray()['questions'][0]['type']);
        $this->assertSame('input', $quiz->toArray()['questions'][1]['type']);
    }
}
