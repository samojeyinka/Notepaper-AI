<?php

namespace Tests\Feature;

use App\Enums\FontStyle;
use App\Enums\SprintChallengeType;
use App\Enums\StudyPlanActivity;
use App\Enums\StudyPlanStatus;
use App\Enums\TokenActionType;
use App\Enums\UserModerationsStatus;
use App\Models\Flashcard;
use App\Models\LegalDocument;
use App\Models\Note;
use App\Models\NoteVersion;
use App\Models\Paper;
use App\Models\PaperVersion;
use App\Models\Presentation;
use App\Models\PublicToken;
use App\Models\Quiz;
use App\Models\SecureToken;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Models\StudyPlan;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\UserModeration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelFactoriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sprint_factories_create_renderable_records(): void
    {
        $user = User::factory()->create();

        $sprint = Sprint::factory()
            ->for($user)
            ->has(SprintChallenge::factory()->count(3), 'challenges')
            ->create();

        $this->assertSame($user->id, $sprint->user_id);
        $this->assertCount(3, $sprint->challenges);
        $this->assertSame(0, $sprint->challenges_filled);

        $locked = SprintChallenge::factory()->locked()->create();
        $this->assertNull($locked->content);

        $quiz = SprintChallenge::factory()->ofType(SprintChallengeType::Quiz)->create();
        $this->assertArrayHasKey('questions', $quiz->content);
        $this->assertArrayHasKey('correct_index', $quiz->content['questions'][0]);
    }

    public function test_document_factories_create_renderable_records(): void
    {
        $user = User::factory()->create();

        $paper = Paper::factory()
            ->for($user)
            ->has(PaperVersion::factory()->count(2), 'paperVersions')
            ->create();

        $this->assertInstanceOf(FontStyle::class, $paper->font_style);
        $this->assertCount(2, $paper->paperVersions);

        $noteVersion = NoteVersion::factory()->for(Note::factory()->create(), 'note')->create();
        $this->assertNotNull($noteVersion->note_id);

        $presentation = Presentation::factory()->for($user)->create();
        $slides = json_decode($presentation->slides, true);

        $this->assertIsArray($slides);
        $this->assertCount($presentation->slide_count, $slides);
        $this->assertSame('title', $slides[0]['layout']);
        $this->assertSame('closing', $slides[count($slides) - 1]['layout']);

        $flashcard = Flashcard::factory()->for($user)->create();
        $this->assertNotEmpty($flashcard->cards);
        $this->assertArrayHasKey('front', $flashcard->cards[0]);
        $this->assertArrayHasKey('back', $flashcard->cards[0]);

        $quiz = Quiz::factory()->for($user)->create();

        $this->assertSame($quiz->question_count, count($quiz->questions));

        foreach ($quiz->questions as $question) {
            $this->assertContains($question['type'], ['multiple', 'input']);
            $this->assertNotEmpty($question['question']);
            $this->assertArrayHasKey('correct', $question);

            if ($question['type'] === 'multiple') {
                $this->assertCount(4, $question['options']);
                $this->assertIsInt($question['correct']);
            }
        }
    }

    public function test_study_plan_factory_creates_schedule_tasks(): void
    {
        $plan = StudyPlan::factory()->create();

        $this->assertSame(StudyPlanStatus::Active, $plan->status);
        $this->assertNotEmpty($plan->schedule);

        foreach ($plan->schedule as $day) {
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $day['date']);
            $this->assertNotEmpty($day['tasks']);

            foreach ($day['tasks'] as $task) {
                $this->assertArrayHasKey('id', $task);
                $this->assertContains($task['type'], array_column(StudyPlanActivity::cases(), 'value'));
                $this->assertNotEmpty($task['title']);
                $this->assertNotEmpty($task['material']);
                $this->assertIsInt($task['duration_min']);
                $this->assertIsBool($task['done']);
            }
        }

        $pending = StudyPlan::factory()->pending()->create();
        $this->assertSame(StudyPlanStatus::Pending, $pending->status);
        $this->assertNull($pending->schedule);
    }

    public function test_ticket_factories_create_ticket_with_messages(): void
    {
        $ticket = Ticket::factory()
            ->open()
            ->has(TicketMessage::factory()->count(2), 'messages')
            ->create();

        $this->assertStringStartsWith('NP-', $ticket->id);
        $this->assertCount(2, $ticket->messages);
    }

    public function test_system_model_factories_create_records(): void
    {
        $moderation = UserModeration::factory()->create();
        $this->assertSame(UserModerationsStatus::PENDING, $moderation->status);
        $this->assertNull($moderation->reviewed_by);

        $approved = UserModeration::factory()->approved()->create();
        $this->assertSame(UserModerationsStatus::APPROVED, $approved->status);
        $this->assertNotNull($approved->reviewed_by);

        $publicToken = PublicToken::factory()->create();
        $this->assertSame(TokenActionType::PASSWORD_RESET, $publicToken->type);
        $this->assertNotNull($publicToken->expires_at);

        $secureToken = SecureToken::factory()->create();
        $this->assertSame(TokenActionType::PASSWORD_CHANGE, $secureToken->type);
        $this->assertNotNull($secureToken->expires_at);

        $document = LegalDocument::factory()->create();
        $this->assertSame('1.0.0', $document->version);
        $this->assertNotEmpty($document->content);
    }
}
