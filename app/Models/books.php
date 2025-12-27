<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class books extends Model
{
    use HasFactory;
    protected $table = 'books';
    protected $primaryKey = 'book_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'title',
        'isbn',
        'category_id',
        'supplier_id',
    ];

    /**
     * Category of the book.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(categories::class, 'category_id', 'category_id');
    }

    /**
     * Supplier of the book.
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(supplier::class, 'supplier_id', 'supplier_id');
    }

    /**
     * Authors of the book.
     */
    public function bookAuthors(): HasMany
    {
        return $this->hasMany(book_authors::class, 'book_id', 'book_id');
    }

    /**
     * Requested books.
     */
    public function requestBooks(): HasMany
    {
        return $this->hasMany(request_books::class, 'book_id', 'book_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\BookFactory::new();
    }

    /**
     * Create a book with authors.
     */
    public function withAuthors(int $authorCount = 1): static
    {
        $book = $this->create();
        
        for ($i = 0; $i < $authorCount; $i++) {
            $book->bookAuthors()->create([
                'author_name' => fake()->name(),
                'bio' => fake()->optional(0.7)->paragraph(),
            ]);
        }
        
        return $book;
    }
}
