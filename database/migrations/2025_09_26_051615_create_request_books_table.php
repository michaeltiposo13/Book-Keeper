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
        Schema::create('request_books', function (Blueprint $table) {
            $table->id('request_id'); // Primary key
            $table->unsignedBigInteger('borrower_id'); // FK to borrowers
            $table->unsignedBigInteger('book_id'); // FK to books
            $table->date('request_date');
            $table->date('borrow_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('return_date')->nullable();
            $table->string('approval_status');
            $table->integer('quantity');
            $table->text('remarks')->nullable();
            $table->timestamps();
        
            // Foreign keys
            $table->foreign('borrower_id')
                  ->references('borrower_id')
                  ->on('borrowers')
                  ->onDelete('cascade');
        
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
        Schema::dropIfExists('request_books');
    }
};
