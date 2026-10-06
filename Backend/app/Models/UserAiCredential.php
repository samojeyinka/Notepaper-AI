<?php

namespace App\Models;

use App\Enums\AiProvider;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAiCredential extends Model
{
    /** @use HasFactory<\Database\Factories\UserAiCredentialFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'provider',
        'key',
        'model',
        'is_default',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'provider'   => AiProvider::class,
            'key'        => 'encrypted',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
