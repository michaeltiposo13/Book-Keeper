<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id('book_id'); // Primary key
            $table->string('title', 200); // Required title
            $table->string('isbn', 50)->unique()->nullable(); // Unique, but optional
            $table->unsignedBigInteger('category_id')->nullable(); // FK to categories
            $table->unsignedBigInteger('supplier_id')->nullable(); // FK to suppliers
            $table->timestamps();
        
            // Foreign key - categories exists before books
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('categories')
                  ->onDelete('set null'); // Optional: keeps books if category is deleted
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
