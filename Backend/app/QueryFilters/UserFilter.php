<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class UserFilter extends SortFilter
{
    protected array $allowed = ['searching', 'type', 'verified', 'sort'];

    protected array $sortable = ['created_at', 'full_name', 'email'];

    public function searching(Builder $query, string $value)
    {
        $query->where(function ($q) use ($value) {
            $q->where('full_name', 'like', "%{$value}%")
                ->orWhere('email', 'like', "%{$value}%");
        });
    }

    public function type(Builder $query, string $value)
    {
        $query->where('type', $value);
    }

    public function verified(Builder $query, string $value)
    {
        if ($value == 1 || $value == true) {
            $query->whereNotNull('email_verified_at');
        } elseif ($value == 0 || $value == false) {
            $query->whereNull('email_verified_at');
        }

    }
}
