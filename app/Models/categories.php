<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class categories extends Model
{
    use HasFactory;

    protected $table = 'categories';
    protected $primaryKey = 'category_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'category_name',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(books::class, 'category_id', 'category_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\CategoryFactory::new();
    }
}
