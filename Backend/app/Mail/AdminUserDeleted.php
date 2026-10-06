<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminUserDeleted extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public bool $isPermanent = false) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isPermanent
                ? 'Your Notepaper account has been permanently removed'
                : 'Your Notepaper account has been deactivated',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.user-deleted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
