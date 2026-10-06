<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

class NoteVersionFilter extends SortFilter
{
    protected array $allowed = ['searching', 'sort', 'note_content', 'created_at'];

    protected array $sortable = ['created_at', 'content'];

    public function noteContent(Builder $query, string $value)
    {
        $this->searching($query, $value);
    }

    public function created_at(Builder $query, string $value)
    {
        $query->orderBy('created_at', $value === 'asc' ? 'asc' : 'desc');
    }

    public function searching(Builder $query, string $value)
    {
        $query->where(function ($q) use ($value) {
            $q->where('note_content', 'like', "%{$value}%");
        });
    }
}
