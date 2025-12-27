<?php

namespace Database\Factories;

use App\Models\supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\supplier>
 */
class SupplierFactory extends Factory
{
    protected $model = supplier::class;

    public function definition(): array
    {
        return [
            'supplier_name' => '',
            'contact_info' => '',
        ];
    }
}

