<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            $table->dropForeign(['site_admin_id']);
            $table->dropColumn([
                'latitude',
                'longitude',
                'contact_email',
                'contact_phone',
                'operational_hours',
                'address',
                'site_admin_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('region');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('contact_email')->nullable()->after('longitude');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->text('operational_hours')->nullable()->after('contact_phone');
            $table->string('address')->nullable()->after('operational_hours');
            $table->unsignedBigInteger('site_admin_id')->nullable()->after('address');
            $table->foreign('site_admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
