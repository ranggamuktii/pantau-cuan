<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;
    
    protected $fillable = ['stock_code', 'ipo_price', 'current_price'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
