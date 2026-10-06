<?php

namespace App\Services;

use App\Http\Resources\LegalDocumentResource;
use App\Models\LegalDocument;

class LegalDocumentService
{
    public function update(array $validated)
    {
        $legalDoc = LegalDocument::updateOrCreate(
            [
                'type' => $validated['type'],
                'for'  => $validated['for'],
            ],
            [
                'content' => $validated['content'],
                'version' => $validated['version'] ?? '1.0.0',
            ]
        );

        return new LegalDocumentResource($legalDoc);
    }

    public function fetch(array $validated)
    {
        $legalDoc = LegalDocument::where('type', $validated['type'])->where('for', $validated['for'])->first();

        return new LegalDocumentResource($legalDoc);

    }
}
