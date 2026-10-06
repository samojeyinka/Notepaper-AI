<?php

namespace Database\Seeders;

use App\Enums\RolesEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // create roles
        $userRole = Role::findOrCreate(RolesEnum::USER->value, 'api');
        $adminRole = Role::findOrCreate(RolesEnum::ADMIN->value, 'api');
        $superAdminRole = Role::findOrCreate(RolesEnum::SUPER_ADMIN->value, 'api');

        $superAdminRole->givePermissionTo(Permission::all());

    }
}
