<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class FolderFilter extends SortFilter
{
    protected array $allowed = ['searching', 'sort', 'name', 'updated_at'];

    protected array $sortable = ['updated_at', 'name'];

    public function name(Builder $query, string $value)
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
            $q->where('name', 'like', "%{$value}%");
        });
    }
}
