<?php

namespace App\Models;

use App\Enums\LegalDocumentType;
use App\Enums\RolesEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'for',
        'content',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'type' => LegalDocumentType::class,
            'for'  => RolesEnum::class,
        ];
    }
}
