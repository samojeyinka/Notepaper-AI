<?php

namespace App\Models;

use App\Enums\TokenActionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicToken extends Model
{
    use HasFactory;

    protected $table = 'public_tokens';

    protected $fillable = [
        'email',
        'token',
        'type',
        'created_at',
        'expires_at',
    ];

    protected $hidden = [
        'token',
        'expires_at',
    ];

    public function casts(): array
    {
        return [
            'type'       => TokenActionType::class,
            'created_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public $primaryKey = 'email';

    public $incrementing = false;

    public $timestamps = false;
}
