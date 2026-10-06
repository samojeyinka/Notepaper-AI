<?php

namespace App\Services;

use App\Mail\AdminUserDeleted;
use App\Mail\AdminUserRestored;
use App\Models\User;
use App\QueryFilters\UserFilter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminService
{
    protected $userModel;

    //       $records = collect($validated['ids'])->map(fn($id) => [
    //     'user_id' => $id,
    //     'requested_by' => $request->user()->id,
    //     'reason' => $validated['reason'],
    //     'status' => 'pending',
    //     'created_at' => now(),
    //     'updated_at' => now(),
    // ])->toArray();

    // UserModeration::insert($records);

    public function __construct(User $user)
    {
        $this->userModel = $user;
    }

    public function users(UserFilter $filter)
    {
        return $this->userModel->with('roles')->filter($filter)->paginate(10);
    }

    public function destroy(array $ids)
    {
        $users = $this->userModel->whereIn('id', $ids)->get();
        $this->userModel->whereIn('id', $ids)->delete();

        foreach ($users as $user) {
            try {
                Mail::to($user->email)->send(new AdminUserDeleted($user, false));
            } catch (\Throwable $e) {
                Log::error('AdminUserDeleted mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }
    }

    public function restore(array $ids)
    {
        $this->userModel->withTrashed()->whereIn('id', $ids)->restore();
        $users = $this->userModel->whereIn('id', $ids)->get();

        foreach ($users as $user) {
            try {
                Mail::to($user->email)->send(new AdminUserRestored($user));
            } catch (\Throwable $e) {
                Log::error('AdminUserRestored mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }
    }

    public function forceDestroy(array $ids)
    {
        $users = $this->userModel->withTrashed()->whereIn('id', $ids)->get();

        foreach ($users as $user) {
            try {
                Mail::to($user->email)->send(new AdminUserDeleted($user, true));
            } catch (\Throwable $e) {
                Log::error('AdminUserDeleted (permanent) mail failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }

        $this->userModel->withTrashed()->whereIn('id', $ids)->forceDelete();
    }

    public function trashed(UserFilter $filter)
    {
        return $this->userModel->onlyTrashed()->with('roles')->filter($filter)->paginate(10);
    }
}
