<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('table_configurations', function (Blueprint $table) {
            $table->dropUnique('table_configurations_table_name_column_key_unique');
            $table->unique(['table_name', 'column_key', 'site_id'], 'table_configurations_tbl_col_site_unique');
        });
    }

    public function down(): void
    {
        Schema::table('table_configurations', function (Blueprint $table) {
            $table->dropUnique('table_configurations_tbl_col_site_unique');
            $table->unique(['table_name', 'column_key'], 'table_configurations_table_name_column_key_unique');
        });
    }
};
