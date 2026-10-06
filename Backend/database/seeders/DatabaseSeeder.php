<?php

namespace Database\Seeders;

use App\Models\Folder;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionSeeder::class);

        User::factory()->superAdmin()->create([
            'email'     => 'admin4@example.com',
            'full_name' => 'Main Admin',
        ]);

        User::factory()->count(3)->superAdmin()->create();

        User::factory()->count(5)->admin()->create();
        User::factory()->count(20)->user()->create();

        // Find your existing user (by email or ID)
        $user = User::where('email', 'samojeyinka@example.com')->first();

        // 1. Create 10 standalone notes for THIS user
        Note::factory()
            ->count(10)
            ->recycle($user)
            ->create();

        // 2. Create 5 folders (each with 3 notes) all for THIS user
        Folder::factory()
            ->count(5)
            ->hasNotes(3)
            ->recycle($user) // This is the magic part
            ->create();

        // php artisan migrate:fresh --seed
        // php artisan db:seed

        // using tinker
        // App\Models\User::factory()->admin()->create();

    }
}
