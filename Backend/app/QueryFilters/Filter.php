<?php

namespace App\QueryFilters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

abstract class Filter
{
    public function __construct(protected Request $request) {}

    protected array $allowed = [];

    public function apply(Builder $query): Builder
    {
        foreach ($this->request->only($this->allowed) as $key => $value) {
            if (method_exists($this, $key) && filled($value)) {
                $this->$key($query, $value);
            }
        }

        return $query;
    }
}
