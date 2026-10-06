<?php

namespace App\Models;

use App\Enums\FlashcardTemplate;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Flashcard extends Model
{
    use BelongsToUser, HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'folder_id',
        'title',
        'template',
        'cards',
        'font_family',
        'font_size',
        'bg_color',
        'text_color',
        'is_bold',
        'is_italic',
        'style_overrides',
    ];

    protected function casts(): array
    {
        return [
            'template'        => FlashcardTemplate::class,
            'cards'           => 'array',
            'font_size'       => 'integer',
            'is_bold'         => 'boolean',
            'is_italic'       => 'boolean',
            'style_overrides' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }
}
