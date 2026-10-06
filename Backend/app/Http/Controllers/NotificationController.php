<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = auth()->user()
            ->notifications()
            ->latest()
            ->paginate(15)
            ->through(fn (DatabaseNotification $n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'data'       => $n->data,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at,
            ]);

        return $this->successResponse('Notifications', $notifications, 200);
    }

    public function markAsRead(DatabaseNotification $notification): JsonResponse
    {
        abort_if($notification->notifiable_id !== auth()->id(), 403);

        $notification->markAsRead();

        return $this->successResponse('Notification marked as read', null, 200);
    }

    public function markAllAsRead(): JsonResponse
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);

        return $this->successResponse('All notifications marked as read', null, 200);
    }

    public function destroy(DatabaseNotification $notification): JsonResponse
    {
        abort_if($notification->notifiable_id !== auth()->id(), 403);

        $notification->delete();

        return $this->successResponse('Notification deleted', null, 200);
    }
}
