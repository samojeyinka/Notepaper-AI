<?php

namespace App\Services;

use App\Events\TicketCreated;
use App\Events\TicketMessageSent;
use App\Events\TicketStatusUpdated;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Notifications\TicketCreated as TicketCreatedNotification;
use App\Notifications\TicketNewMessage;
use App\Notifications\TicketStatusChanged;
use Illuminate\Support\Facades\Notification;

class TicketService
{
    public function create(User $user, array $data): Ticket
    {
        $ticket = Ticket::create([
            'user_id'  => $user->id,
            'subject'  => $data['subject'],
            'details'  => $data['details'],
            'priority' => $data['priority'] ?? 'normal',
            'category' => $data['category'] ?? 'technical_issue',

        ]);

        $ticket->load('user');

        // Seed the first message from the ticket details
        $message = $ticket->messages()->create([
            'user_id' => $user->id,
            'body'    => $data['details'],
        ]);
        $message->load('user');

        broadcast(new TicketCreated($ticket))->toOthers();
        broadcast(new TicketMessageSent($message))->toOthers();

        $admins = User::role(['admin', 'super_admin'])->get()->push($user);
        Notification::send($admins, new TicketCreatedNotification($ticket));

        return $ticket;
    }

    public function sendMessage(Ticket $ticket, User $sender, string $body, ?string $image = null): TicketMessage
    {
        $message = $ticket->messages()->create([
            'user_id' => $sender->id,
            'body'    => $body,
            'image'   => $image ?? null,
        ]);

        $message->load('user');

        broadcast(new TicketMessageSent($message))->toOthers();
        $recipients = User::role(['admin', 'super_admin'])
            ->where('id', '!=', $sender->id)
            ->get()
            ->push($ticket->user)
            ->unique('id')
            ->filter(fn (User $u) => $u->id !== $sender->id);
        Notification::send($recipients, new TicketNewMessage($message, $sender));

        return $message;
    }

    public function updateStatus(Ticket $ticket, string $status): Ticket
    {
        $oldStatus = $ticket->status;

        $ticket->update(['status' => $status]);

        broadcast(new TicketStatusUpdated($ticket));

        $ticket->user->notify(new TicketStatusChanged($ticket, $oldStatus));

        return $ticket;
    }
}
