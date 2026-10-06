<?php

namespace App\Services;

use App\Enums\UserModerationsStatus;
use App\Mail\ReportMailToSuperAdmin;
use App\Mail\SuspensionMail;
use App\Models\User;
use App\Models\UserModeration;
use Illuminate\Support\Facades\Mail;

class UserModerationService
{
    protected $userModel;

    public function __construct(User $user)
    {
        $this->userModel = $user;
    }

    public function report(array $validated)
    {

        $ids = (array) $validated['ids'];

        $requestedBy = auth()->user();

        $selected = collect($validated['ids'])->map(fn ($id) => [
            'user_id'      => $id,
            'requested_by' => $requestedBy->id,
            'reason'       => $validated['reason'],
            'status'       => UserModerationsStatus::PENDING->value,
            'created_at'   => now(),
            'updated_at'   => now(),

        ])->toArray();

        UserModeration::insert($selected);

        $emails = $this->userModel->role('super_admin')->whereNotNull('email_verified_at')->pluck('email');

        if ($emails->isNotEmpty()) {
            Mail::bcc($emails)->send(new ReportMailToSuperAdmin(count($selected), $requestedBy));
        }

        return $selected;
    }

    public function action(array $validated)
    {

        $ids = $validated['ids'];
        $status = UserModerationsStatus::from($validated['status']);

        $moderations = UserModeration::whereIn('id', $ids)
            ->get(['id', 'user_id', 'status', 'reason']);

        $alreadyOnStatus = $moderations
            ->where('status', $status)
            ->pluck('id');

        if ($alreadyOnStatus->isNotEmpty()) {

            abort(422, 'Some moderation records already have this status');

        }

        UserModeration::bulkUpdateStatus($moderations, $status);

        $moderations->load(['user', 'requestedBy', 'reviewedBy']);

        if ($status === UserModerationsStatus::APPROVED) {
            foreach ($moderations as $moderation) {
                if ($moderation->user?->email) {
                    Mail::to($moderation->user->email)
                        ->send(new SuspensionMail($moderation->user, $moderation->reason));
                }
            }
        }

        return ['moderations' => $moderations, 'status' => $status->value];
    }
}
