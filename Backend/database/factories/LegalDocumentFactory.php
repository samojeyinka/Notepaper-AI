<?php

namespace Database\Factories;

use App\Enums\LegalDocumentType;
use App\Enums\RolesEnum;
use App\Models\LegalDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LegalDocument>
 */
class LegalDocumentFactory extends Factory
{
    protected $model = LegalDocument::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type'    => $this->faker->randomElement(LegalDocumentType::cases()),
            'for'     => $this->faker->randomElement(RolesEnum::cases()),
            'content' => $this->faker->paragraphs(5, true),
            'version' => '1.0.0',
        ];
    }
}
