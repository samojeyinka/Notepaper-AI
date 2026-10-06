<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketRequest;
use App\Http\Requests\TicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function __construct(private TicketService $ticketService) {}

    public function index(): JsonResponse
    {
        $user = auth()->user();
        $tickets = $user->hasAnyRole(['admin', 'super_admin'])
            ? Ticket::with('user')->latest()->get()
            : Ticket::where('user_id', $user->id)->latest()->get();

        return $this->successResponse('All tickets', TicketResource::collection($tickets), 200);
    }

    public function store(TicketRequest $request): JsonResponse
    {
        $ticket = $this->ticketService->create(auth()->user(), $request->validated());
        $ticket->load('user');

        return $this->successResponse('Ticket created', new TicketResource($ticket), 201);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorizeTicketAccess($ticket);

        $ticket->load(['user', 'messages.user']);

        return $this->successResponse('Ticket details', new TicketResource($ticket), 200);
    }

    public function updateStatus(TicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        abort_unless(auth()->user()->hasAnyRole(['admin', 'super_admin']), 403);

        $data = $request->validated();

        $ticket = $this->ticketService->updateStatus($ticket, $data['status']);

        return $this->successResponse('Status updated', new TicketResource($ticket), 200);
    }

    private function authorizeTicketAccess(Ticket $ticket): void
    {
        $user = auth()->user();
        abort_unless(
            $user->id === $ticket->user_id || $user->hasAnyRole(['admin', 'super_admin']),
            403
        );
    }
}
