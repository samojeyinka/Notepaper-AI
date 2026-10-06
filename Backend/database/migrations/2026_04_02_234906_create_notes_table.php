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
        Schema::create('notes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('folder_id')->constrained()->cascadeOnDelete();
            $table->text('title')->default('Untitled note');
            $table->longText('content')->nullable();
            $table->string('paper_type')->default('ruled');
            $table->string('paper_line_color')->default('#A0C8E0');
            $table->string('paper_background_color')->default('#ffffff');
            $table->string('font_style')->default('Inter');
            $table->string('text_color')->default('#000000');
            $table->boolean('is_pinned')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
