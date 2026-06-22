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
        Schema::create('custom_master_data_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_master_data_type_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['custom_master_data_type_id', 'value'], 'cmd_type_value_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_master_data_values');
    }
};
