<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class supplier extends Model
{
    use HasFactory;
    
    protected $table = 'suppliers';
    protected $primaryKey = 'supplier_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'supplier_name',
        'contact_info',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(books::class, 'supplier_id', 'supplier_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\SupplierFactory::new();
    }
}
