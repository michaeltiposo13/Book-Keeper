<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class payments extends Model
{
    use HasFactory;

    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'request_id',
        'amount',
        'payment_date',
        'payment_method',
        'payment_type',
        'reference_no',
        'paid_status',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function requestBook(): BelongsTo
    {
        return $this->belongsTo(request_books::class, 'request_id', 'request_id');
    }

    protected static function newFactory()
    {
        return \Database\Factories\PaymentFactory::new();
    }
}
