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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id'); // Primary key
            $table->unsignedBigInteger('request_id'); // FK to request_books
            $table->decimal('amount', 10, 2); // Amount with precision
            $table->date('payment_date');
            $table->string('payment_method');
            $table->string('payment_type');
            $table->string('reference_no')->nullable();
            $table->string('paid_status');
            $table->text('remarks')->nullable();
            $table->timestamps();
        
            // Foreign key constraint
            $table->foreign('request_id')
                  ->references('request_id')
                  ->on('request_books')
                  ->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
