<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            // Drop the varchar status, add integer with FK
            $table->dropColumn('status');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('status_id')->default(1)->constrained('asset_statuses')->after('site_id');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
            $table->string('status', 100)->default('not_updated');
        });
    }
};
