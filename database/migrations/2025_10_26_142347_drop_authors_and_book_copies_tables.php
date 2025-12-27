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
        // This migration runs last to clean up old tables
        Schema::dropIfExists('authors');
        Schema::dropIfExists('book_copies');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only drops tables, so the down method can be empty
        // If you need to recreate them, you would need to define the structure here
    }
};
