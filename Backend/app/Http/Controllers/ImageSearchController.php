<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImageSearchRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class ImageSearchController extends Controller
{
    public function search(ImageSearchRequest $request): JsonResponse
    {
        $data = $request->validated();

        $response = Http::get('https://pixabay.com/api/', [
            'key'        => config('services.pixabay.key'),
            'q'          => $data['q'],
            'page'       => $data['page'] ?? 1,
            'per_page'   => 20,
            'image_type' => $data['image_type'] ?? 'photo',
            'safesearch' => 'true',
            'order'      => 'popular',
        ]);

        if ($response->failed()) {
            return $this->errorResponse('Image search failed.', 502);
        }

        $body = $response->json();

        $hits = array_map(fn ($hit) => [
            'id'      => $hit['id'],
            'preview' => $hit['previewURL'],
            'web'     => $hit['webformatURL'],
            'large'   => $hit['largeImageURL'],
            'user'    => $hit['user'],
            'tags'    => $hit['tags'],
        ], $body['hits'] ?? []);

        return $this->successResponse('Image search results', [
            'total' => $body['totalHits'] ?? 0,
            'hits'  => $hits,
        ]);
    }
}
