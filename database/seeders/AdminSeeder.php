<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\borrowers;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $adminExists = borrowers::where('email', 'admin@library.com')->first();
        
        if (!$adminExists) {
            borrowers::create([
                'name' => 'Admin User',
                'email' => 'admin@library.com',
                'password_hash' => Hash::make('admin123'),
                'joined_date' => now()->toDateString(),
                'role' => 'Administrator',
            ]);
            
            $this->command->info('Admin account created successfully!');
            $this->command->info('Email: admin@library.com');
            $this->command->info('Password: admin123');
        } else {
            $this->command->info('Admin account already exists.');
        }
    }
}
