<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class borrowers extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'borrowers';
    protected $primaryKey = 'borrower_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'joined_date',
        'role',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'joined_date' => 'date',
    ];

    public function requestBooks(): HasMany
    {
        return $this->hasMany(request_books::class, 'borrower_id', 'borrower_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\BorrowerFactory::new();
    }
}

