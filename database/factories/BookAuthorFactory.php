<?php

namespace Database\Factories;

use App\Models\book_authors;
use App\Models\books;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\book_authors>
 */
class BookAuthorFactory extends Factory
{
    protected $model = book_authors::class;

    public function definition(): array
    {
        return [
            'book_id' => '',
            'author_name' => '',
            'bio' => '',
        ];
    }
}

