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
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->string('category')->nullable()->after('part_number');
            $table->string('location')->nullable()->after('site_id');
            $table->string('status')->default('available')->after('location');
            $table->json('specifications')->nullable()->after('status');
            $table->json('compatibility')->nullable()->after('specifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropColumn(['category', 'location', 'status', 'specifications', 'compatibility']);
        });
    }
};
