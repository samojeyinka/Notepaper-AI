<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'full_name'       => $this->full_name,
            'email'           => $this->email,
            'profile_picture' => $this->profile_picture,
            'plan'            => $this->plan ?? 'free',
            'type'            => $this->type,
            'roles'           => $this->whenLoaded(
                'roles',
                fn () => $this->roles->pluck('name')->all(),
                fn () => $this->getRoleNames()->all(),
            ),
            'google2fa_enabled' => (bool) $this->google2fa_enabled,
            'email_verified_at' => ! is_null($this->email_verified_at),
            'created_at'        => $this->created_at,
        ];
    }
}
