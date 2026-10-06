<?php

namespace App\Models;

use App\Enums\TicketCategory;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'subject', 'details', 'status', 'priority', 'category'];

    protected $primaryKey = 'id';

    protected function casts(): array
    {
        return [
            'status'   => TicketStatus::class,
            'priority' => TicketPriority::class,
            'category' => TicketCategory::class,
        ];
    }

    public $incrementing = false;

    public $keyType = 'string';

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Ticket $ticket) {
            $ticket->id = static::generateTicketId();
        });
    }

    protected static function generateTicketId(): string
    {
        do {
            $id = 'NP-' . random_int(1000, 9999);
        } while (static::where('id', $id)->exists());

        return $id;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }
}
