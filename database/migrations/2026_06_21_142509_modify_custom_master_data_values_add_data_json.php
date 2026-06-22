<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('custom_master_data_values', function (Blueprint $table) {
            $table->json('data')->nullable()->after('custom_master_data_type_id');
        });

        // Migrate existing data into the new JSON column
        DB::table('custom_master_data_values')->get()->each(function ($row) {
            DB::table('custom_master_data_values')->where('id', $row->id)->update([
                'data' => json_encode([
                    'label' => $row->label,
                    'value' => $row->value,
                    'is_active' => (bool) $row->is_active,
                ]),
            ]);
        });

        // Drop the composite unique constraint first
        Schema::table('custom_master_data_values', function (Blueprint $table) {
            // Use raw SQL to avoid FK constraint issues
            $table->dropColumn(['label', 'value', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('custom_master_data_values', function (Blueprint $table) {
            $table->string('label')->nullable();
            $table->string('value')->nullable();
            $table->boolean('is_active')->default(true);
        });

        Schema::table('custom_master_data_values', function (Blueprint $table) {
            $table->dropColumn('data');
        });
    }
};
