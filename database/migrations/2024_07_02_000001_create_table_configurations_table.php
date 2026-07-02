<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('table_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('table_name'); // e.g., 'assets', 'users'
            $table->string('column_key'); // e.g., 'asset_id', 'name', 'status'
            $table->string('column_title'); // Display title e.g., 'Asset Tag', 'Asset Name'
            $table->string('data_type')->default('string'); // string, number, date, boolean, etc.
            $table->string('data_source')->nullable(); // Field name in database or custom data source
            $table->boolean('is_primary_key')->default(false);
            $table->boolean('is_sortable')->default(true);
            $table->boolean('is_filterable')->default(true);
            $table->boolean('is_visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->integer('width')->nullable(); // Column width in pixels
            $table->string('alignment')->default('left'); // left, center, right
            $table->text('format_pattern')->nullable(); // For custom formatting
            $table->json('options')->nullable(); // Additional options as JSON
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['table_name', 'sort_order']);
            $table->index(['table_name', 'is_visible']);
            $table->unique(['table_name', 'column_key']); // Ensure unique column keys per table
        });
    }

    public function down()
    {
        Schema::dropIfExists('table_configurations');
    }
};
