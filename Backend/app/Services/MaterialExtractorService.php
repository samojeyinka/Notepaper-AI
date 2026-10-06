<?php

namespace App\Services;

use App\Models\Flashcard;
use App\Models\Note;
use App\Models\Paper;
use App\Models\Presentation;
use App\Models\Quiz;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory as SpreadsheetFactory;
use PhpOffice\PhpWord\IOFactory as WordFactory;
use Smalot\PdfParser\Parser as PdfParser;

class MaterialExtractorService
{
    public static function extractFromUploadedFile(UploadedFile $file): ?string
    {
        $mime = $file->getMimeType() ?? '';
        $extension = strtolower($file->getClientOriginalExtension());

        try {
            return match (true) {
                str_contains($mime, 'pdf')                                                          => self::extractPdf($file->getRealPath(), 99999, 9999),
                str_contains($mime, 'word') || str_contains($mime, 'officedocument.wordprocessing') => self::extractDocx($file->getRealPath(), 99999, 9999),
                in_array($extension, ['xlsx', 'xls', 'csv'])                                        => self::extractSpreadsheet($file->getRealPath()),
                default                                                                             => null,
            };
        } catch (\Throwable) {
            return null;
        }
    }

    public static function countWords(string $type, string $id): int
    {
        $text = self::extract($type, $id, 99999, 9999);

        return $text ? str_word_count(strip_tags($text)) : 0;
    }

    public static function extract(string $type, string $id, int $charLimitPerPage, int $maxPages): ?string
    {
        return match ($type) {
            'note'         => self::extractNote($id, $charLimitPerPage, $maxPages),
            'paper'        => self::extractPaper($id, $charLimitPerPage, $maxPages),
            'flashcard'    => self::extractFlashcard($id, $maxPages),
            'presentation' => self::extractPresentation($id, $maxPages),
            'quiz'         => self::extractQuiz($id, $maxPages),
            'upload'       => self::extractUpload($id, $charLimitPerPage, $maxPages),
            default        => null,
        };
    }

    private static function extractNote(string $id, int $charLimitPerPage, int $maxPages): ?string
    {
        $note = Note::find($id);

        if (! $note?->content) {
            return null;
        }

        return self::extractPagesJson($note->content, $charLimitPerPage, $maxPages);
    }

    private static function extractPaper(string $id, int $charLimitPerPage, int $maxPages): ?string
    {
        $paper = Paper::find($id);

        if (! $paper?->content) {
            return null;
        }

        return self::extractPagesJson($paper->content, $charLimitPerPage, $maxPages);
    }

    /**
     * Note/Paper content: {"pages":["page 1 text","page 2 text",...],"fontSize":16,...}
     */
    private static function extractPagesJson(string $json, int $charLimitPerPage, int $maxPages): ?string
    {
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return mb_substr(strip_tags($json), 0, $charLimitPerPage * $maxPages);
        }

        // Handle {"pages": [...]} and bare array [...] formats
        $pages = $data['pages'] ?? (array_is_list($data) ? $data : []);
        $texts = [];

        foreach (array_slice($pages, 0, $maxPages) as $page) {
            $clean = trim(strip_tags((string) $page));

            if ($clean !== '') {
                $texts[] = mb_substr($clean, 0, $charLimitPerPage);
            }
        }

        return $texts ? implode("\n\n", $texts) : null;
    }

    /**
     * Flashcard cards: [{"front":"Q","back":"A"},...]
     */
    private static function extractFlashcard(string $id, int $maxPages): ?string
    {
        $flashcard = Flashcard::find($id);

        if (! $flashcard?->cards) {
            return null;
        }

        $lines = [];

        foreach (array_slice($flashcard->cards, 0, $maxPages) as $card) {
            $front = trim((string) ($card['front'] ?? ''));
            $back = trim((string) ($card['back'] ?? ''));

            if ($front !== '' && $back !== '') {
                $lines[] = "Q: {$front}\nA: {$back}";
            }
        }

        return $lines ? implode("\n\n", $lines) : null;
    }

    /**
     * Presentation slides: [{"slide":1,"title":"...","bullets":[...],"speaker_notes":"..."},...]
     */
    private static function extractPresentation(string $id, int $maxPages): ?string
    {
        $presentation = Presentation::find($id);

        if (! $presentation?->slides) {
            return null;
        }

        $slides = is_string($presentation->slides)
            ? json_decode($presentation->slides, true)
            : $presentation->slides;

        if (! is_array($slides)) {
            return null;
        }

        $lines = [];

        foreach (array_slice($slides, 0, $maxPages) as $slide) {
            $parts = [];

            if (! empty($slide['title'])) {
                $parts[] = $slide['title'];
            }

            if (! empty($slide['bullets']) && is_array($slide['bullets'])) {
                foreach ($slide['bullets'] as $bullet) {
                    if (trim((string) $bullet) !== '') {
                        $parts[] = '• ' . $bullet;
                    }
                }
            }

            if (! empty($slide['speaker_notes'])) {
                $parts[] = trim((string) $slide['speaker_notes']);
            }

            if ($parts) {
                $lines[] = implode("\n", $parts);
            }
        }

        return $lines ? implode("\n\n---\n\n", $lines) : null;
    }

    /**
     * Quiz questions: [{"question":"...","options":[...],"correct_index":1,"explanation":"..."},...]
     */
    private static function extractQuiz(string $id, int $maxPages): ?string
    {
        $quiz = Quiz::find($id);

        if (! $quiz?->questions) {
            return null;
        }

        $lines = [];

        foreach (array_slice($quiz->questions, 0, $maxPages) as $item) {
            $q = trim((string) ($item['question'] ?? ''));

            if ($q === '') {
                continue;
            }

            $parts = [$q];

            if (! empty($item['explanation'])) {
                $parts[] = 'Explanation: ' . $item['explanation'];
            }

            $lines[] = implode(' ', $parts);
        }

        return $lines ? implode("\n", $lines) : null;
    }

    /**
     * Upload: $id is a storage path like "sprint-uploads/{sprintId}/file.pdf"
     * Supports PDF and DOCX only.
     */
    private static function extractUpload(string $path, int $charLimitPerPage, int $maxPages): ?string
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            return null;
        }

        $fullPath = $disk->path($path);
        $mime = mime_content_type($fullPath);

        try {
            return match (true) {
                str_contains($mime, 'pdf')                                           => self::extractPdf($fullPath, $charLimitPerPage, $maxPages),
                str_contains($mime, 'word') || str_contains($mime, 'officedocument') => self::extractDocx($fullPath, $charLimitPerPage, $maxPages),
                default                                                              => null,
            };
        } catch (\Throwable) {
            return null;
        }
    }

    private static function extractPdf(string $path, int $charLimitPerPage, int $maxPages): ?string
    {
        $parser = new PdfParser;
        $pdf = $parser->parseFile($path);
        $pages = $pdf->getPages();
        $texts = [];

        foreach (array_slice($pages, 0, $maxPages) as $page) {
            $clean = trim($page->getText());

            if ($clean !== '') {
                $texts[] = mb_substr($clean, 0, $charLimitPerPage);
            }
        }

        return $texts ? implode("\n\n---\n\n", $texts) : null;
    }

    private static function extractDocx(string $path, int $charLimitPerPage, int $maxPages): ?string
    {
        $word = WordFactory::load($path);
        $sections = $word->getSections();
        $texts = [];
        $pageCount = 0;

        foreach ($sections as $section) {
            if ($pageCount >= $maxPages) {
                break;
            }

            $lines = [];

            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text = trim((string) $element->getText());

                    if ($text !== '') {
                        $lines[] = $text;
                    }
                }
            }

            if ($lines) {
                $texts[] = mb_substr(implode("\n", $lines), 0, $charLimitPerPage);
                $pageCount++;
            }
        }

        return $texts ? implode("\n\n---\n\n", $texts) : null;
    }

    private static function extractSpreadsheet(string $path): ?string
    {
        $spreadsheet = SpreadsheetFactory::load($path);
        $lines = [];

        foreach ($spreadsheet->getWorksheetIterator() as $sheet) {
            $sheetLines = [];

            foreach ($sheet->getRowIterator() as $row) {
                $cells = [];

                foreach ($row->getCellIterator() as $cell) {
                    $value = trim((string) $cell->getFormattedValue());

                    if ($value !== '') {
                        $cells[] = $value;
                    }
                }

                if ($cells) {
                    $sheetLines[] = implode(' | ', $cells);
                }
            }

            if ($sheetLines) {
                $lines[] = "Sheet: {$sheet->getTitle()}\n" . implode("\n", $sheetLines);
            }
        }

        return $lines ? implode("\n\n", $lines) : null;
    }
}
