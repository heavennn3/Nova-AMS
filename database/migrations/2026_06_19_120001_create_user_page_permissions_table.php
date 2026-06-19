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
        Schema::create('user_page_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('page_permission_id')->constrained()->onDelete('cascade');
            $table->boolean('can_create')->default(false);
            $table->boolean('can_read')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'page_permission_id']);
            $table->index('user_id');
            $table->index('page_permission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_page_permissions');
    }
};