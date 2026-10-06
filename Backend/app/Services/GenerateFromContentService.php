<?php

namespace App\Services;

use App\Ai\Agents\FlashcardGeneratorAgent;
use App\Ai\Agents\NoteGeneratorAgent;
use App\Ai\Agents\PresentationGeneratorAgent;
use App\Ai\Agents\QuizGeneratorAgent;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class GenerateFromContentService
{
    private const CHAR_LIMIT_PER_PAGE = 2500;

    private const MAX_PAGES = 20;

    private const MAX_MATERIALS = 15;

    /**
     * Extract and validate content from library items + uploaded files.
     * Returns the combined text to inject into the AI prompt.
     */
    public function extractContent(User $user, array $materialIds, array $uploads): string
    {
        $parts = [];
        $count = 0;

        foreach ($materialIds as $material) {
            if ($count >= self::MAX_MATERIALS) {
                break;
            }

            $text = MaterialExtractorService::extract(
                $material['type'] ?? '',
                $material['id'] ?? '',
                self::CHAR_LIMIT_PER_PAGE,
                self::MAX_PAGES
            );

            if ($text) {
                $parts[] = $text;
                $count++;
            }
        }

        foreach ($uploads as $file) {
            $text = MaterialExtractorService::extractFromUploadedFile($file);

            if ($text) {
                $parts[] = mb_substr($text, 0, self::CHAR_LIMIT_PER_PAGE * self::MAX_PAGES);
            }
        }

        if (empty($parts)) {
            throw ValidationException::withMessages([
                'material_ids' => 'No readable content found in the selected materials.',
            ]);
        }

        return implode("\n\n---\n\n", $parts);
    }

    /** @return array<int, array{front: string, back: string}> */
    public function generateFlashcards(string $content, int $count, ?string $topic): array
    {
        $result = (new FlashcardGeneratorAgent($content, $count, $topic))->prompt('');
        $data = json_decode((string) $result, true);

        return $data['cards'] ?? [];
    }

    /** @return array<int, array{question: string, options: array, correct_index: int, explanation: string}> */
    public function generateQuiz(string $content, int $count, string $difficulty, string $questionType, ?string $topic): array
    {
        $result = (new QuizGeneratorAgent($content, $count, $difficulty, $questionType, $topic))->prompt('');
        $data = json_decode((string) $result, true);

        return $data['questions'] ?? [];
    }

    /** @return array<int, array{slide: int, type: string, title: string, bullets: array, speaker_notes: string}> */
    public function generatePresentation(string $content, int $slideCount, ?string $topic): array
    {
        $result = (new PresentationGeneratorAgent($content, $slideCount, $topic))->prompt('');
        $data = json_decode((string) $result, true);

        return $data['slides'] ?? [];
    }

    public function generateNotes(string $content, string $tone, string $length, ?string $topic): string
    {
        $result = (new NoteGeneratorAgent($content, $tone, $length, $topic))->prompt('');
        $data = json_decode((string) $result, true);

        return $data['content'] ?? '';
    }
}
