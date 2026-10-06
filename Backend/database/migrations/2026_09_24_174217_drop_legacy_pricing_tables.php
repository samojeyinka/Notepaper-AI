<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove the legacy pricing/usage schema (plans, feature usage, billing).
     */
    public function up(): void
    {
        if (Schema::hasColumn('users', 'plan')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('plan');
            });
        }

        foreach (['transactions', 'subscriptions', 'feature_usage'] as $table) {
            Schema::dropIfExists($table);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('users', 'plan')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('plan')->default('free')->nullable();
            });
        }
    }
};
