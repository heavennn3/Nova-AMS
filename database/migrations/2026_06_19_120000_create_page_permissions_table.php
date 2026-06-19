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
        Schema::create('page_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Page name like 'assets', 'licenses', 'users'
            $table->string('route'); // Route path like '/assets', '/licenses'
            $table->string('description')->nullable();
            $table->string('module')->nullable(); // Associated module like 'module.asset-inventory'
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->unique('name');
            $table->index('route');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_permissions');
    }
};