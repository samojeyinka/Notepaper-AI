<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $symbol = config('plans.currency', 'ngn') === 'ngn' ? '₦' : '$';

        return [
            'id'               => $this->id,
            'reference'        => $this->paystack_reference,
            'plan'             => $this->plan->value,
            'plan_label'       => $this->plan->label(),
            'interval'         => $this->interval,
            'currency'         => $this->currency,
            'amount'           => $this->amount,
            'amount_formatted' => $symbol . number_format($this->amount / 100, 2),
            'status'           => $this->status,
            'paid_at'          => $this->paid_at?->toISOString(),
            'created_at'       => $this->created_at->toISOString(),
        ];
    }
}
