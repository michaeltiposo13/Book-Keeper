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
        Schema::create('book_authors', function (Blueprint $table) {
            $table->id('book_author_id');
            $table->unsignedBigInteger('book_id');
            $table->string('author_name', 150);
            $table->text('bio')->nullable();
            $table->timestamps();
        
            // Foreign key
            $table->foreign('book_id')
                  ->references('book_id')
                  ->on('books')
                  ->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_authors');
    }
};
