<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing notes that still have the old default font
        DB::table('notes')
            ->where('font_style', 'Caveat')
            ->update(['font_style' => 'Inter']);

        // Change the column default for new notes
        Schema::table('notes', function (Blueprint $table) {
            $table->string('font_style')->default('Inter')->change();
        });
    }

    public function down(): void
    {
        DB::table('notes')
            ->where('font_style', 'Inter')
            ->update(['font_style' => 'Caveat']);

        Schema::table('notes', function (Blueprint $table) {
            $table->string('font_style')->default('Caveat')->change();
        });
    }
};
