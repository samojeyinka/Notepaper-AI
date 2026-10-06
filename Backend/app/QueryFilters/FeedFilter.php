<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class FeedFilter extends SortFilter
{
    protected array $allowed = ['searching', 'type', 'title', 'updated_at', 'sort'];

    protected array $sortable = ['updated_at', 'title', 'snippet'];

    public function title(Builder $query, string $value)
    {
        $this->searching($query, $value);
    }

    public function updated_at(Builder $query, string $value)
    {
        $query->orderBy('updated_at', $value === 'asc' ? 'asc' : 'desc');
    }

    public function searching(Builder $query, string $value)
    {
        $query->where(function ($q) use ($value) {
            $q->where('title', 'like', "%{$value}%")
                ->orWhere('snippet', 'like', "%{$value}%");
        });
    }

    public function type(Builder $query, string $value)
    {
        $query->where('type', $value);
    }
}
