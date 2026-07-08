<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop FK constraint first (MySQL 8 requires this before dropping FK column)
        DB::statement('ALTER TABLE spare_parts DROP FOREIGN KEY spare_parts_spare_part_category_id_foreign');

        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropColumn([
                'spare_part_id',
                'spare_part_category_id',
                'quantity',
                'minimum_stock_level',
                'unit_cost',
                'asset_type_id',
                'compatibility',
                'specifications',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->string('spare_part_id')->nullable();
            $table->foreignId('spare_part_category_id')->nullable()->constrained('spare_part_categories')->nullOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('minimum_stock_level')->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->foreignId('asset_type_id')->nullable()->constrained('asset_types')->nullOnDelete();
            $table->json('compatibility')->nullable();
            $table->json('specifications')->nullable();
        });
    }
};
