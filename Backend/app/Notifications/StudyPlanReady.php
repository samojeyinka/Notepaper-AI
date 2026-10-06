<?php

namespace App\Notifications;

use App\Models\StudyPlan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudyPlanReady extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $url;

    public function __construct(public readonly StudyPlan $studyPlan)
    {
        $this->url = url(config('app.frontend_url') . '/lockedin/study-plans/' . $this->studyPlan->id);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your study plan \"{$this->studyPlan->name}\" is ready!")
            ->view('emails.plan.study-ready', [
                'full_name' => $notifiable->full_name,
                'name'      => $this->studyPlan->name,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'study_plan_ready',
            'study_plan_id' => $this->studyPlan->id,
            'title'         => 'Your study plan is ready!',
            'description'   => "\"{$this->studyPlan->name}\" has been generated. Your schedule is waiting.",
            'url'           => $this->url,
            'placeholder'   => 'View Plan',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
