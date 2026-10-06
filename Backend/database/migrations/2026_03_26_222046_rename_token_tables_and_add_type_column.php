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
        // 1. Public Tokens
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropPrimary();
        });
        Schema::rename('password_reset_tokens', 'public_tokens');
        Schema::table('public_tokens', function (Blueprint $table) {
            $table->string('type')->default('password_reset')->after('email');
            $table->primary(['email', 'token', 'type']);
        });

        // 2. Secure Tokens
        Schema::table('change_passwords', function (Blueprint $table) {
            $table->dropPrimary();
        });
        Schema::rename('change_passwords', 'secure_tokens');
        Schema::table('secure_tokens', function (Blueprint $table) {
            $table->string('type')->default('password_change')->after('user_id');
            $table->primary(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert Secure Tokens
        Schema::table('secure_tokens', function (Blueprint $table) {
            $table->dropPrimary();
        });
        Schema::rename('secure_tokens', 'change_passwords');
        Schema::table('change_passwords', function (Blueprint $table) {
            $table->primary('email');
            $table->dropColumn('type');
        });

        // 2. Revert Public Tokens
        Schema::table('public_tokens', function (Blueprint $table) {
            $table->dropPrimary();
        });
        Schema::rename('public_tokens', 'password_reset_tokens');
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->primary('email');
            $table->dropColumn('type');
        });
    }
};
