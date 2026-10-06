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
        Schema::create('sprint_challenges', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('sprint_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type');
            $table->json('content')->nullable();
            $table->string('status')->default('locked');
            $table->integer('challenge_order');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('reminder_30_sent_at')->nullable();
            $table->timestamp('reminder_10_sent_at')->nullable();
            $table->unsignedTinyInteger('post_reminder_count')->default(0);
            $table->timestamp('last_post_reminder_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sprint_challenges');
    }
};
