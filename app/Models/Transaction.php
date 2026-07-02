<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_sid_id',
        'stock_id',
        'lots',
        'buy_price',
        'sell_price',
        'total_buy_fee',
        'total_sell_fee',
        'net_profit',
        'status',
    ];

    public function accountSid()
    {
        return $this->belongsTo(AccountSid::class);
    }

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
