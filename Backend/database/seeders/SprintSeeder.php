<?php

namespace Database\Seeders;

use App\Enums\SprintChallengeStatus;
use App\Enums\SprintChallengeType;
use App\Enums\SprintStatus;
use App\Models\Sprint;
use App\Models\SprintChallenge;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SprintSeeder extends Seeder
{
    public const USER_ID = '01knhgzwdq3vxg7ea275pvmza7';

    /**
     * Seed demo sprints for the target user.
     *
     * Run with: php artisan db:seed --class=SprintSeeder
     */
    public function run(): void
    {
        $user = User::find(self::USER_ID);

        if ($user === null) {
            $this->command?->warn('SprintSeeder: user ' . self::USER_ID . ' not found — nothing seeded.');

            return;
        }

        Sprint::where('user_id', $user->id)->forceDelete();

        $this->seedActiveSprint($user);
        $this->seedCompletedSprint($user);
    }

    private function seedActiveSprint(User $user): void
    {
        $sprint = Sprint::factory()->for($user)->state([
            'title'      => 'Biology Finals Sprint',
            'goal'       => 'Master cell biology, genetics, and metabolism before the final exam.',
            'start_date' => now()->subDays(5),
            'end_date'   => now()->addDays(9),
            'status'     => SprintStatus::Active,
        ])->create();

        $outline = [
            ['Cell Structure Foundations', 'Organelles, membranes, and the differences between prokaryotic and eukaryotic cells.', SprintChallengeType::Concept, SprintChallengeStatus::Completed],
            ['Membranes & Transport', 'Diffusion, osmosis, and active transport mechanisms.', SprintChallengeType::Quiz, SprintChallengeStatus::Completed],
            ['Organelles Deep Dive', 'Mitochondria, ribosomes, and the endomembrane system at a glance.', SprintChallengeType::Quickpoints, SprintChallengeStatus::Active],
            ['Enzyme Kinetics', 'Substrates, activation energy, and factors that influence reaction rates.', SprintChallengeType::Concept, SprintChallengeStatus::Ready],
            ['Metabolism & ATP', 'Glycolysis, the Krebs cycle, and oxidative phosphorylation.', SprintChallengeType::Quiz, SprintChallengeStatus::Ready],
            ['Cellular Respiration', 'Reading through aerobic respiration and its three major stages.', SprintChallengeType::Reading, SprintChallengeStatus::Ready],
            ['Photosynthesis Review', 'Light reactions, the Calvin cycle, and limiting factors.', SprintChallengeType::Quickpoints, SprintChallengeStatus::Ready],
            ['DNA Replication', 'Origins of replication, polymerases, and proofreading.', SprintChallengeType::Quiz, SprintChallengeStatus::Locked],
            ['Protein Synthesis', 'Transcription, translation, and the genetic code.', SprintChallengeType::Concept, SprintChallengeStatus::Locked],
            ['Cell Division', 'Mitosis, meiosis, and checkpoint regulation.', SprintChallengeType::Quiz, SprintChallengeStatus::Locked],
            ['Genetics Fundamentals', "Mendel's laws, Punnett squares, and inheritance patterns.", SprintChallengeType::Concept, SprintChallengeStatus::Locked],
            ['Mutation & Repair', 'Point mutations, chromosomal aberrations, and repair pathways.', SprintChallengeType::Reading, SprintChallengeStatus::Locked],
            ['Weak Areas Revision', 'Targeted review of your lowest-scoring topics so far.', SprintChallengeType::Quickpoints, SprintChallengeStatus::Locked],
            ['Grand Finale Mock Exam', 'Comprehensive exam covering everything from this sprint.', SprintChallengeType::Quiz, SprintChallengeStatus::Locked],
        ];

        $this->createChallenges($sprint, $outline);
    }

    private function seedCompletedSprint(User $user): void
    {
        $sprint = Sprint::factory()->for($user)->completed()->state([
            'title'      => 'Economics Midterm Sprint',
            'goal'       => 'Cover supply, demand, market structures, and macro indicators for the midterm.',
            'start_date' => now()->subDays(30),
            'end_date'   => now()->subDays(16),
        ])->create();

        $outline = [
            ['Supply & Demand Basics', 'Curves, shifts, and market equilibrium fundamentals.', SprintChallengeType::Quickpoints],
            ['Market Equilibrium', 'Price floors, ceilings, and surplus/shortage analysis.', SprintChallengeType::Quiz],
            ['Elasticity', 'Price, income, and cross elasticity with real-world examples.', SprintChallengeType::Concept],
            ['Consumer Choice', 'Utility, budget constraints, and indifference curves.', SprintChallengeType::Reading],
            ['Production & Costs', 'Short-run and long-run cost curves explained.', SprintChallengeType::Quiz],
            ['Market Structures', 'Perfect competition, monopoly, oligopoly, and monopolistic competition.', SprintChallengeType::Concept],
            ['Labour Markets', 'Wage determination, unions, and minimum wage effects.', SprintChallengeType::Quickpoints],
            ['Externalities', 'Positive and negative externalities plus policy responses.', SprintChallengeType::Reading],
            ['GDP & Inflation', 'Measuring output, CPI, and the causes of inflation.', SprintChallengeType::Quiz],
            ['Final Review', 'The full picture tied together before your midterm.', SprintChallengeType::Concept],
        ];

        $outline = array_map(fn (array $row): array => [...$row, SprintChallengeStatus::Completed], $outline);

        $this->createChallenges($sprint, $outline);
    }

    /**
     * @param  array<int, array{0: string, 1: string, 2: SprintChallengeType, 3: SprintChallengeStatus}>  $outline
     */
    private function createChallenges(Sprint $sprint, array $outline): void
    {
        foreach ($outline as $index => [$title, $description, $type, $status]) {
            $scheduledAt = Carbon::parse($sprint->start_date)->addDays($index)->setTime(17, 0);

            $factory = SprintChallenge::factory()
                ->for($sprint)
                ->ofType($type)
                ->state([
                    'title'           => $title,
                    'description'     => $description,
                    'challenge_order' => $index + 1,
                    'scheduled_at'    => $scheduledAt,
                ]);

            $factory = match ($status) {
                SprintChallengeStatus::Locked    => $factory->locked(),
                SprintChallengeStatus::Active    => $factory->active(),
                SprintChallengeStatus::Completed => $factory->completed()->state([
                    'completed_at' => $scheduledAt->copy()->addHours(2),
                ]),
                default => $factory,
            };

            $factory->create();
        }

        $sprint->update([
            'challenges_count'  => count($outline),
            'challenges_filled' => count(array_filter($outline, fn (array $row): bool => $row[3] !== SprintChallengeStatus::Locked)),
        ]);
    }
}
