<?php

namespace App\Http\Controllers;

use App\Http\Requests\FetchLegalDocRequest;
use App\Http\Requests\LegalDocumentRequest;
use App\Services\LegalDocumentService;

class LegalDocumentController extends Controller
{
    public function __construct(protected LegalDocumentService $legalDocumentService) {}

    public function update(LegalDocumentRequest $request)
    {
        $doc = $this->legalDocumentService->update($request->validated());

        return $this->successResponse('Legal document updated successfully.', $doc, 201);
    }

    public function fetch(FetchLegalDocRequest $request)
    {
        $doc = $this->legalDocumentService->fetch($request->validated());

        return $this->successResponse('Legal document retrieved.', $doc);
    }
}
