<?php

namespace App\Notifications;

use App\Models\SprintChallenge;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SprintChallengeReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $url;

    public function __construct(
        public readonly SprintChallenge $challenge,
        public readonly string $reminderType,
    ) {
        $this->url = url(config('app.frontend_url') . '/lockedin/sprints/' . $this->challenge->sprint_id);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $sprintTitle = $this->challenge->sprint?->title ?? 'your sprint';
        $challengeTitle = $this->challenge->title;

        $subject = match ($this->reminderType) {
            '30min'  => "Your sprint challenge starts in 30 minutes — {$sprintTitle}",
            '10min'  => "10 minutes left — {$challengeTitle}",
            'post_1' => "You haven't studied \"{$challengeTitle}\" yet",
            'post_2' => "Don't fall behind — attempt \"{$challengeTitle}\" today",
            default  => "Last call — complete \"{$challengeTitle}\" before the day ends",
        };

        $intro = match ($this->reminderType) {
            '30min'  => "Your challenge \"{$challengeTitle}\" from the sprint \"{$sprintTitle}\" starts in 30 minutes. Get ready!",
            '10min'  => "Only 10 minutes until \"{$challengeTitle}\" from \"{$sprintTitle}\". Open the app now!",
            'post_1' => "You haven't studied or attempted \"{$challengeTitle}\" yet — it's part of your sprint \"{$sprintTitle}\". Jump in, it won't take long.",
            'post_2' => "You're yet to attempt \"{$challengeTitle}\" from \"{$sprintTitle}\". Don't break your momentum.",
            default  => "Final reminder — \"{$challengeTitle}\" from \"{$sprintTitle}\" is still waiting. Complete it to stay on track.",
        };

        return (new MailMessage)
            ->subject($subject)->view('emails.challenge.reminder', [
                'subject'   => $subject,
                'full_name' => $notifiable->full_name,
                'intro'     => $intro,
                'url'       => $this->url,
            ]);

    }

    public function toArray(object $notifiable): array
    {
        $sprintTitle = $this->challenge->sprint?->title ?? 'your sprint';
        $challengeTitle = $this->challenge->title;

        $title = match ($this->reminderType) {
            '30min'  => "Challenge starting soon — {$sprintTitle}",
            '10min'  => "10 minutes left — {$challengeTitle}",
            'post_1' => "You haven't studied \"{$challengeTitle}\" yet",
            'post_2' => "Don't fall behind on \"{$sprintTitle}\"",
            default  => "Final reminder: \"{$challengeTitle}\"",
        };

        $description = match ($this->reminderType) {
            '30min'  => "\"{$challengeTitle}\" from \"{$sprintTitle}\" starts in 30 minutes.",
            '10min'  => "\"{$challengeTitle}\" from \"{$sprintTitle}\" starts in 10 minutes.",
            'post_1' => "You haven't studied or attempted \"{$challengeTitle}\" yet. Tap to open your sprint.",
            'post_2' => "You're yet to attempt \"{$challengeTitle}\" from \"{$sprintTitle}\".",
            default  => "\"{$challengeTitle}\" from \"{$sprintTitle}\" is still waiting. Complete it to stay on track.",
        };

        return [
            'type'         => 'sprint_reminder',
            'reminder'     => $this->reminderType,
            'challenge_id' => $this->challenge->id,
            'sprint_id'    => $this->challenge->sprint_id,
            'title'        => $title,
            'description'  => $description,
            'url'          => $this->url,
            'placeholder'  => 'Go to Sprint',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
