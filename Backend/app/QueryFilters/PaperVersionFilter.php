<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class PaperVersionFilter extends SortFilter
{
    protected array $allowed = ['searching', 'sort', 'created_at'];

    protected array $sortable = ['created_at'];

    public function created_at(Builder $query, string $value)
    {
        $query->orderBy('created_at', $value === 'asc' ? 'asc' : 'desc');
    }

    public function searching(Builder $query, string $value)
    {
        $query->where(function ($q) use ($value) {
            $q->where('content', 'like', "%{$value}%");
        });
    }
}
