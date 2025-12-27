<?php

namespace Database\Factories;

use App\Models\borrowers;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\borrowers>
 */
class BorrowerFactory extends Factory
{
    protected $model = borrowers::class;

    public function definition(): array
    {
        return [
            'name' => '',
            'email' => '',
            'password_hash' => '',
            'joined_date' => '',
        ];
    }
}

