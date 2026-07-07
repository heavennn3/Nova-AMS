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
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->foreignId('site_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            $table->index(['site_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropIndex(['site_id', 'status']);
            $table->dropForeign(['site_id']);
            $table->dropColumn('site_id');
        });
    }
};
