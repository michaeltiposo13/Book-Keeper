<?php

namespace Database\Factories;

use App\Models\books;
use App\Models\categories;
use App\Models\supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\books>
 */
class BookFactory extends Factory
{
    protected $model = books::class;

    public function definition(): array
    {
        return [
            'title' => '',
            'isbn' => '',
            'category_id' => '',
            'supplier_id' => '',
        ];
    }
}


