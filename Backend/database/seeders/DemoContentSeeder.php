<?php

namespace Database\Seeders;

use App\Models\Flashcard;
use App\Models\Paper;
use App\Models\PaperVersion;
use App\Models\Presentation;
use App\Models\Quiz;
use App\Models\Sprint;
use App\Models\StudyPlan;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

class DemoContentSeeder extends Seeder
{
    /**
     * Seed demo content for the target user (see SprintSeeder::USER_ID).
     * Each section is skipped when the user already has data for that model,
     * so the seeder is safe to re-run.
     *
     * Run with: php artisan db:seed --class=DemoContentSeeder
     */
    public function run(): void
    {
        $user = User::find(SprintSeeder::USER_ID);

        if ($user === null) {
            $this->command?->warn('DemoContentSeeder: user ' . SprintSeeder::USER_ID . ' not found — nothing seeded.');

            return;
        }

        $this->seedSection('sprints', Sprint::class, $user, fn (): mixed => $this->call(SprintSeeder::class));
        $this->seedSection('papers', Paper::class, $user, fn (): mixed => Paper::factory()
            ->count(3)
            ->for($user)
            ->has(PaperVersion::factory()->count(2), 'paperVersions')
            ->create());
        $this->seedSection('presentations', Presentation::class, $user, fn (): mixed => Presentation::factory()
            ->count(2)
            ->for($user)
            ->create());
        $this->seedSection('flashcards', Flashcard::class, $user, fn (): mixed => Flashcard::factory()
            ->count(3)
            ->for($user)
            ->create());
        $this->seedSection('quizzes', Quiz::class, $user, fn (): mixed => Quiz::factory()
            ->count(2)
            ->for($user)
            ->create());
        $this->seedSection('study plans', StudyPlan::class, $user, fn (): mixed => StudyPlan::factory()
            ->count(2)
            ->for($user)
            ->create());
        $this->seedSection('tickets', Ticket::class, $user, fn (): mixed => Ticket::factory()
            ->count(2)
            ->for($user)
            ->has(TicketMessage::factory()->count(2)->state(['user_id' => $user->id]), 'messages')
            ->create());
    }

    /**
     * Run $seed when the user has no rows for $model; otherwise report the skip.
     *
     * @param  class-string<Model>  $model
     */
    private function seedSection(string $label, string $model, User $user, callable $seed): void
    {
        if ($model::where('user_id', $user->id)->exists()) {
            $this->command?->info('Skipping ' . $label . ' — user already has data.');

            return;
        }

        $seed();

        $this->command?->info('Seeded ' . $label . '.');
    }
}
