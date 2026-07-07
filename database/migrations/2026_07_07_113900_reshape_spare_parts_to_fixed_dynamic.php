<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            // Add human-readable spare part ID
            $table->string('spare_part_id')->nullable()->unique()->after('id');

            // Add FK to dynamic categories
            $table->foreignId('spare_part_category_id')->nullable()->after('name')
                  ->constrained('spare_part_categories')->nullOnDelete();
        });

        // Rename stock_level to quantity
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->renameColumn('stock_level', 'quantity');
        });
    }

    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropColumn(['spare_part_id', 'spare_part_category_id']);
            $table->renameColumn('quantity', 'stock_level');
        });
    }
};
