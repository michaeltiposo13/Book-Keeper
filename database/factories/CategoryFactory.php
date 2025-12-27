<?php

namespace Database\Factories;

use App\Models\categories;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\categories>
 */
class CategoryFactory extends Factory
{
    protected $model = categories::class;

    public function definition(): array
    {
        return [
            'category_name' => '',
        ];
    }
}


