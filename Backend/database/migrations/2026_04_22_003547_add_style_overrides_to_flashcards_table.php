<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->json('style_overrides')->nullable()->after('is_italic');
        });
    }

    public function down(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropColumn('style_overrides');
        });
    }
};
