<?php

namespace App\Notifications;

use App\Models\StudyPlan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudyPlanFailed extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $url;

    public function __construct(public readonly StudyPlan $studyPlan)
    {
        $this->url = config('app.frontend_url') . '/lockedin/study-plans';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Study plan generation failed — \"{$this->studyPlan->name}\"")
            ->view('emails.plan.study-failed', [
                'full_name' => $notifiable->full_name,
                'name'      => $this->studyPlan->name,
                'url'       => $this->url,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'study_plan_failed',
            'study_plan_id' => $this->studyPlan->id,
            'title'         => 'Study plan generation failed',
            'description'   => "We couldn't generate your study plan \"{$this->studyPlan->name}\". Please try creating it again.",
            'url'           => $this->url,
            'placeholder'   => 'Try Again',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
