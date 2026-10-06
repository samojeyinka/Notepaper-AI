<?php

namespace App\Models;

use App\Enums\TokenActionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecureToken extends Model
{
    use HasFactory;

    protected $table = 'secure_tokens';

    protected $fillable = [
        'email',
        'user_id',
        'token',
        'type',
        'expires_at',
        'created_at',
    ];

    protected $hidden = [
        'user_id',
        'token',
        'expires_at',
    ];

    public function casts(): array
    {
        return [
            'type'       => TokenActionType::class,
            'token'      => 'hashed',
            'created_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public $incrementing = false;

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
