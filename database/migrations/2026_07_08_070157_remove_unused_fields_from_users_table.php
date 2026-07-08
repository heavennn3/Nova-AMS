<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'ic_number', 'profile_photo']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 50)->nullable()->after('is_active');
            $table->string('ic_number', 50)->nullable()->after('phone');
            $table->string('profile_photo')->nullable()->after('ic_number');
        });
    }
};
