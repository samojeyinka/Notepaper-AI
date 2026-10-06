<?php

use App\Models\SprintChallenge;
use App\Notifications\SprintChallengeReminder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Send 30-minute pre-challenge reminders
Schedule::call(function () {
    $window = now()->addMinutes(30);

    SprintChallenge::with('sprint.user')
        ->whereNull('completed_at')
        ->whereNull('reminder_30_sent_at')
        ->whereNotNull('scheduled_at')
        ->whereBetween('scheduled_at', [now()->addMinutes(25), $window])
        ->get()
        ->each(function (SprintChallenge $challenge) {
            $user = $challenge->sprint?->user;

            if ($user) {
                $user->notify(new SprintChallengeReminder($challenge, '30min'));
                $challenge->update(['reminder_30_sent_at' => now()]);
            }
        });
})->everyFiveMinutes()->name('sprint:remind-30min');

// Send 10-minute pre-challenge reminders
Schedule::call(function () {
    $window = now()->addMinutes(10);

    SprintChallenge::with('sprint.user')
        ->whereNull('completed_at')
        ->whereNull('reminder_10_sent_at')
        ->whereNotNull('scheduled_at')
        ->whereBetween('scheduled_at', [now()->addMinutes(8), $window])
        ->get()
        ->each(function (SprintChallenge $challenge) {
            $user = $challenge->sprint?->user;

            if ($user) {
                $user->notify(new SprintChallengeReminder($challenge, '10min'));
                $challenge->update(['reminder_10_sent_at' => now()]);
            }
        });
})->everyFiveMinutes()->name('sprint:remind-10min');

// Send post-due reminders (up to 3, every 10 minutes after scheduled_at)
Schedule::call(function () {
    SprintChallenge::with('sprint.user')
        ->whereNull('completed_at')
        ->whereNotNull('scheduled_at')
        ->where('scheduled_at', '<', now())
        ->where('post_reminder_count', '<', 3)
        ->where(function ($q) {
            $q->whereNull('last_post_reminder_at')
                ->orWhere('last_post_reminder_at', '<', now()->subHours(2));
        })
        ->get()
        ->each(function (SprintChallenge $challenge) {
            $user = $challenge->sprint?->user;

            if (! $user) {
                return;
            }

            $reminderNum = $challenge->post_reminder_count + 1;
            $type = match ($reminderNum) {
                1       => 'post_1',
                2       => 'post_2',
                default => 'post_3',
            };

            $user->notify(new SprintChallengeReminder($challenge, $type));

            $challenge->update([
                'post_reminder_count'   => $reminderNum,
                'last_post_reminder_at' => now(),
            ]);
        });
})->everyTenMinutes()->name('sprint:remind-post');
