<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('email');
            $table->text('address')->nullable()->after('logo');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 50)->nullable()->after('email');
            $table->string('ic_number', 50)->nullable()->after('phone');
            $table->string('profile_photo')->nullable()->after('ic_number');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['logo', 'address']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'ic_number', 'profile_photo']);
        });
    }
};
