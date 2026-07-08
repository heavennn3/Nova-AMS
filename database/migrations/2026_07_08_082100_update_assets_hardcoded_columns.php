<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->string('asset_id', 100)->unique()->nullable()->after('id');
            $table->enum('status', ['moved', 'stored', 'used', 'repair', 'faulty', 'not_updated'])->default('not_updated')->after('id');
            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete()->after('site_id');
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete()->after('region_id');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropForeign(['added_by']);
            $table->dropColumn(['asset_id', 'status', 'region_id', 'added_by']);
        });
    }
};
