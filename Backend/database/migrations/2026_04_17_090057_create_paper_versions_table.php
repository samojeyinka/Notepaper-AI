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
        Schema::create('paper_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('paper_id')->constrained()->cascadeOnDelete();
            $table->longText('content')->nullable();
            $table->timestamp('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paper_versions');
    }
};
