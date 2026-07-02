<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IpoSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ticker',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
