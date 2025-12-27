<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class book_authors extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;
    
    protected $table = 'book_authors';
    protected $primaryKey = 'book_author_id';
    public $timestamps = true;

    protected $fillable = [
        'book_id',
        'author_name',
        'bio',
    ];

    protected $casts = [
        'bio' => 'string',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(books::class, 'book_id', 'book_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\BookAuthorFactory::new();
    }
}
