<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('role_id')->nullable()->after('site_id');
        });

        DB::transaction(function () {
            $roleIds = [
                'Admin' => 1,
                'Manager' => 2,
                'Employee' => 3,
            ];

            $users = DB::table('users')
                ->leftJoin('model_has_roles', function ($join) {
                    $join->on('users.id', '=', 'model_has_roles.model_id')
                        ->where('model_has_roles.model_type', '=', 'App\\Models\\User');
                })
                ->leftJoin('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->select('users.id', 'roles.name as role_name')
                ->get();

            foreach ($users as $user) {
                $roleName = $user->role_name ?? 'Employee';
                $roleId = $roleIds[$roleName] ?? 3;

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['role_id' => $roleId]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role_id');
        });
    }
};
