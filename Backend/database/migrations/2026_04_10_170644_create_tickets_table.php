<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->string('id', 10)->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->text('details');
            $table->string('category')->default('technical_issue');
            $table->string('status')->default('open');
            $table->string('priority')->default('normal');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
