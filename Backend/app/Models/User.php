<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserStatus;
use App\Enums\UserTypeEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, HasUlids, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'agreeToTerms',
        'type',
        'profile_picture',
        'remember_me',
        'google2fa_secret',
        'google2fa_enabled',
        'email_verified_at',
        'verification_token',
        'verification_token_expires_at',
        'deletion_reason',
        'google_id',
        'github_id',
    ];

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'verification_token',
        'verification_token_expires_at',
        'google2fa_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'             => 'datetime',
            'password'                      => 'hashed',
            'agreeToTerms'                  => 'boolean',
            'remember_me'                   => 'boolean',
            'verification_token'            => 'hashed',
            'verification_token_expires_at' => 'datetime',
            'google2fa_enabled'             => 'boolean',
            'status'                        => UserStatus::class,
        ];
    }

    public function folders(): HasMany
    {
        return $this->hasMany(Folder::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function scopeFilter(Builder $query, $filter)
    {
        return $filter->apply($query);
    }

    protected static function booted()
    {
        static::creating(function ($user) {
            $user->profile_picture = $user->profile_picture ?? config('app.default_avatar');
        });
    }

    protected function profilePicture(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? config('app.default_avatar'),
        );
    }

    protected function type(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => UserTypeEnum::tryFrom($value ?? UserTypeEnum::STUDENT->value) ?? UserTypeEnum::STUDENT,
        );
    }

    // jwt contract

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function secureTokens()
    {
        return $this->hasMany(SecureToken::class);
    }

    public function aiCredentials(): HasMany
    {
        return $this->hasMany(UserAiCredential::class);
    }

    public function defaultAiCredential(): HasOne
    {
        return $this->hasOne(UserAiCredential::class)->where('is_default', true);
    }
}
