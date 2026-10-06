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
        Schema::create('study_plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('exam_date');
            $table->date('start_date');
            $table->string('study_from', 5)->default('09:00');
            $table->string('study_to', 5)->default('17:00');
            $table->json('active_days')->nullable();
            $table->json('enabled_activities')->nullable();
            $table->json('material_ids')->nullable();
            $table->string('status')->default('pending');
            $table->json('schedule')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_plans');
    }
};
