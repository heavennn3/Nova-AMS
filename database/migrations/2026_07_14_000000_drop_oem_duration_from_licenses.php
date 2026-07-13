<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            if (Schema::hasColumn('licenses', 'oem_id')) {
                $table->dropForeign(['oem_id']);
                $table->dropColumn('oem_id');
            }
            if (Schema::hasColumn('licenses', 'duration_months')) {
                $table->dropColumn('duration_months');
            }
        });
    }

    public function down(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            if (!Schema::hasColumn('licenses', 'oem_id')) {
                $table->foreignId('oem_id')->nullable()->constrained('oems')->nullOnDelete();
            }
            if (!Schema::hasColumn('licenses', 'duration_months')) {
                $table->integer('duration_months')->nullable();
            }
        });
    }
};
