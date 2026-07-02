<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdxStock extends Model
{
    use HasFactory;
    
    protected $table = 'idx_stocks';
    protected $fillable = ['ticker', 'name'];
}
