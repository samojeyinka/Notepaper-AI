<?php

use App\Models\Note;
use App\Models\Paper;
use App\Models\Sprint;
use App\Models\StudyPlan;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('admin.tickets', function ($user) {
    return $user->hasAnyRole(['admin', 'super_admin']);
});

Broadcast::channel('tickets.{ticketId}', function ($user, string $ticketId) {
    $ticket = Ticket::find($ticketId);

    if (! $ticket) {
        return false;
    }

    return $user->id === $ticket->user_id || $user->hasAnyRole(['admin', 'super_admin']);
});

Broadcast::channel('user.{userId}.tickets', function ($user, string $userId) {
    return $user->id === $userId;
});

Broadcast::channel('App.Models.User.{id}', function (User $user, $id) {
    return $user->id === $id;
});

Broadcast::channel('sprints.{sprintId}', function ($user, string $sprintId) {
    $sprint = Sprint::find($sprintId);

    return $sprint && $user->id === $sprint->user_id;
});

Broadcast::channel('study-plans.{planId}', function ($user, string $planId) {
    $plan = StudyPlan::find($planId);

    return $plan && $user->id === $plan->user_id;
});

Broadcast::channel('expand-topic.{id}', function ($user, string $id) {
    $note = Note::find($id);

    if ($note) {
        return $user->id === $note->user_id;
    }

    $paper = Paper::find($id);

    return $paper && $user->id === $paper->user_id;
});

Broadcast::channel('simplify-topic.{id}', function ($user, string $id) {
    $note = Note::find($id);

    if ($note) {
        return $user->id === $note->user_id;
    }
    $paper = Paper::find($id);

    return $paper && $user->id === $paper->user_id;
});
