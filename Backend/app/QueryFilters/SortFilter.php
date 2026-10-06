<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;

abstract class SortFilter extends Filter
{
    protected array $sortable = ['created_at', 'updated_at'];

    public function sort(Builder $query, string $value)
    {
        [$column, $direction] = array_pad(explode(':', $value), 2, 'desc');

        if (in_array($column, $this->sortable)) {

            $query->orderBy($column, $direction === 'asc' ? 'asc' : 'desc');
        }
    }
}
