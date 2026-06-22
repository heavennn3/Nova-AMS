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
        Schema::create('custom_master_data_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_master_data_type_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('data_type')->default('text'); // text, number, date, boolean, select
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->json('options')->nullable(); // for select data_type: ["Option A","Option B"]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_master_data_columns');
    }
};
