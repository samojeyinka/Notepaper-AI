<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class PaperFilter extends SortFilter
{
    protected array $allowed = ['searching', 'sort', 'title', 'updated_at', 'folder_id'];

    protected array $sortable = ['updated_at', 'title'];

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
            $q->where('title', 'like', "%{$value}%");
        });
    }

    public function folder_id(Builder $query, string $value)
    {
        $query->where('folder_id', $value);
    }
}
