<?php

namespace Database\Factories;

use App\Enums\StudyPlanActivity;
use App\Enums\StudyPlanStatus;
use App\Enums\WeekDay;
use App\Models\StudyPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudyPlan>
 */
class StudyPlanFactory extends Factory
{
    protected $model = StudyPlan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = Carbon::tomorrow();
        $examDate = $startDate->copy()->addDays($this->faker->numberBetween(14, 30));

        return [
            'user_id'            => User::factory(),
            'name'               => ucfirst($this->faker->unique()->words(3, true)),
            'exam_date'          => $examDate,
            'start_date'         => $startDate,
            'study_from'         => '09:00',
            'study_to'           => '17:00',
            'active_days'        => WeekDay::cases(),
            'enabled_activities' => StudyPlanActivity::cases(),
            'material_ids'       => [],
            'status'             => StudyPlanStatus::Active,
            'schedule'           => $this->schedule($startDate),
            'generated_at'       => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'status'       => StudyPlanStatus::Pending,
            'schedule'     => null,
            'generated_at' => null,
        ]);
    }

    /**
     * Build the day/task schedule shape the study planner reads.
     *
     * @return array<int, array{date: string, tasks: array<int, array<string, mixed>>}>
     */
    private function schedule(Carbon $startDate): array
    {
        $schedule = [];
        $taskNumber = 1;

        foreach (range(0, 6) as $dayOffset) {
            $tasks = [];

            foreach (range(1, $this->faker->numberBetween(2, 4)) as $_) {
                $activity = $this->faker->randomElement(StudyPlanActivity::cases());

                $tasks[] = [
                    'id'           => 't-' . $taskNumber++,
                    'type'         => $activity->value,
                    'title'        => ucfirst($this->faker->sentence()),
                    'material'     => ucfirst($this->faker->words(3, true)),
                    'duration_min' => $this->faker->numberBetween(20, 60),
                    'done'         => $this->faker->boolean(40),
                ];
            }

            $schedule[] = [
                'date'  => $startDate->copy()->addDays($dayOffset)->toDateString(),
                'tasks' => $tasks,
            ];
        }

        return $schedule;
    }
}
