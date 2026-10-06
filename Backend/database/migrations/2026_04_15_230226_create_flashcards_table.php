<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flashcards', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->default('Untitled Flashcard');
            $table->string('template')->default('girlies');
            $table->json('cards')->nullable();
            $table->string('font_family')->default('sans');
            $table->unsignedSmallInteger('font_size')->default(18);
            $table->string('bg_color')->default('#ffffff');
            $table->string('text_color')->default('#1e293b');
            $table->boolean('is_bold')->default(false);
            $table->boolean('is_italic')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
