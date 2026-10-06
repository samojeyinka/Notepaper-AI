<?php

namespace App\Services;

use App\Models\Flashcard;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class FlashcardService
{
    public function list(User $user, ?string $folderId = null, string $sortBy = 'updated_at', string $sortDir = 'desc', ?string $searching = null): LengthAwarePaginator
    {
        return Flashcard::where('user_id', $user->id)
            ->when($folderId, fn ($q) => $q->where('folder_id', $folderId))
            ->when($searching, fn ($q) => $q->where('title', 'like', "%{$searching}%"))
            ->with('folder')
            ->orderBy($sortBy, $sortDir)
            ->paginate(15);
    }

    public function create(User $user, array $data): Flashcard
    {
        $flashcard = Flashcard::create([
            'user_id'         => $user->id,
            'folder_id'       => $data['folder_id'] ?? null,
            'title'           => $data['title'] ?? 'Untitled Flashcard',
            'template'        => $data['template'] ?? 'girlies',
            'cards'           => $data['cards'] ?? [['front' => '', 'back' => '']],
            'font_family'     => $data['font_family'] ?? 'sans',
            'font_size'       => $data['font_size'] ?? 18,
            'bg_color'        => $data['bg_color'] ?? '#ffffff',
            'text_color'      => $data['text_color'] ?? '#1e293b',
            'is_bold'         => $data['is_bold'] ?? true,
            'is_italic'       => $data['is_italic'] ?? false,
            'style_overrides' => $data['style_overrides'] ?? null,
        ]);

        return $flashcard->loadMissing('folder');
    }

    public function show(string $id, User $user): Flashcard
    {
        return Flashcard::where('id', $id)
            ->where('user_id', $user->id)
            ->with('folder')
            ->firstOrFail();
    }

    public function update(Flashcard $flashcard, array $data): Flashcard
    {
        $flashcard->update($data);

        return $flashcard->loadMissing('folder');
    }

    public function delete(Flashcard $flashcard): void
    {
        $flashcard->delete();
    }

    public function duplicate(Flashcard $flashcard): Flashcard
    {
        $copy = $flashcard->replicate();
        $copy->title = 'Copy of ' . $flashcard->title;
        $copy->save();

        return $copy->loadMissing('folder');
    }

    public function showPublic(string $id): Flashcard
    {
        return Flashcard::where('id', $id)
            ->with('folder')
            ->firstOrFail();
    }
}
