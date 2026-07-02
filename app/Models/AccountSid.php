<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountSid extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sid_name',
        'broker_name',
        'buy_fee_percent',
        'sell_fee_percent',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
