<?php

namespace Database\Factories;

use App\Models\payments;
use App\Models\request_books;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\payments>
 */
class PaymentFactory extends Factory
{
    protected $model = payments::class;

    public function definition(): array
    {
        return [
            'request_id' => '',
            'amount' => '',
            'payment_date' => '',
            'payment_method' => '',
            'payment_type' => '',
            'reference_no' => '',
            'paid_status' => '',
            'remarks' => '',
        ];
    }
}

