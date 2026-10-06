<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketMessageRequest;
use App\Http\Resources\TicketMessageResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;

class TicketMessageController extends Controller
{
    public function __construct(private TicketService $ticketService) {}

    public function store(TicketMessageRequest $request, Ticket $ticket): JsonResponse
    {
        $user = auth()->user();

        abort_unless(
            $user->id === $ticket->user_id || $user->hasAnyRole(['admin', 'super_admin']),
            403
        );

        $data = $request->validated();
        $message = $this->ticketService->sendMessage($ticket, $user, $data['body'], $data['image'] ?? null);

        return $this->successResponse('Message sent', new TicketMessageResource($message), 201);
    }
}
