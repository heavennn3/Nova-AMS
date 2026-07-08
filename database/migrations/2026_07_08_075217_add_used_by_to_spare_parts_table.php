<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            // Change status default
            $table->string('status')->default('available')->change();
            // Add used_by FK
            $table->foreignId('used_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropForeign(['used_by']);
            $table->dropColumn('used_by');
        });
    }
};
