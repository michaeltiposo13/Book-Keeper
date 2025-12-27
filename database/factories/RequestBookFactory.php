<?php

namespace Database\Factories;

use App\Models\request_books;
use App\Models\borrowers;
use App\Models\books;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\request_books>
 */
class RequestBookFactory extends Factory
{
    protected $model = request_books::class;

    public function definition(): array
    {
        return [
            'borrower_id' => '',
            'book_id' => '',
            'request_date' => '',
            'borrow_date' => '',
            'due_date' => '',
            'return_date' => '',
            'approval_status' => '',
            'quantity' => '',
            'remarks' => '',
        ];
    }
}

