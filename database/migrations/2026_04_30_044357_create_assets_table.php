<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_id', 100)->unique()->nullable();
            $table->string('serial_number')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('asset_types')->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('brand')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->year('purchase_year')->nullable();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->enum('status', ['available', 'in_use', 'maintenance', 'faulty', 'retired'])->default('available');
            $table->enum('condition_status', ['good', 'fair', 'poor', 'damaged'])->default('good');
            $table->text('notes')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};