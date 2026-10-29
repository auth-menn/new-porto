<?php

namespace Database\Factories;

use App\Models\Journey;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Journey>
 */
class JourneyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category' => fake()->randomElement(['education', 'internship', 'workExperience']),
            'organization' => fake()->company(),
            'title' => fake()->jobTitle(),
            'logo_path' => null,
            'start_year' => fake()->numberBetween(2018, 2024),
            'end_year' => fake()->numberBetween(2024, 2026),
            'activities' => [fake()->sentence(), fake()->sentence()],
            'documentation_path' => null,
        ];
    }
}
