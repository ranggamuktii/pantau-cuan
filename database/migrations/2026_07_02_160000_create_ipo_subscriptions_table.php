<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipo_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('ticker');
            $table->string('status')->default('active'); // active, notified
            $table->timestamps();
            
            // A user can only subscribe once per ticker
            $table->unique(['user_id', 'ticker']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipo_subscriptions');
    }
};
