<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class request_books extends Model
{
    use HasFactory;

    protected $table = 'request_books';
    protected $primaryKey = 'request_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'borrower_id',
        'book_id',
        'request_date',
        'borrow_date',
        'due_date',
        'return_date',
        'approval_status',
        'quantity',
        'remarks',
    ];

    protected $casts = [
        'request_date' => 'date',
        'borrow_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'quantity' => 'integer',
    ];

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(borrowers::class, 'borrower_id', 'borrower_id');
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(books::class, 'book_id', 'book_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(payments::class, 'request_id', 'request_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\RequestBookFactory::new();
    }
}
