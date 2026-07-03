<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign keys first
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['type_id']);
            $table->dropForeign(['vendor_id']);
            $table->dropForeign(['location_id']);
            $table->dropForeign(['site_id']);
            $table->dropForeign(['supplier_id']);
            $table->dropForeign(['status_label_id']);
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn([
                'asset_id', 'serial_number', 'category_id', 'type_id',
                'product_name', 'brand', 'vendor_id', 'purchase_year',
                'location_id', 'status', 'condition_status', 'notes',
                'latitude', 'longitude', 'quantity', 'site_id', 'image_path',
                'asset_name', 'warranty_months', 'order_number', 'purchase_date',
                'eol_date', 'supplier_id', 'purchase_cost', 'status_label_id',
                'metadata',
                'purchase_price', 'salvage_value', 'useful_life_years',
                'warranty_expiry_date', 'insurance_policy_number', 'health_score', 'barcode_path',
            ]);
        });

        // EAV table for dynamic asset fields
        Schema::create('asset_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('column_key');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['asset_id', 'column_key']);
            $table->index('column_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_field_values');

        Schema::table('assets', function (Blueprint $table) {
            $table->string('asset_id', 100)->unique()->nullable();
            $table->string('serial_number')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('asset_types')->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('brand')->nullable();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->year('purchase_year')->nullable();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('status', 50)->default('available');
            $table->string('condition_status', 50)->default('good');
            $table->text('notes')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('quantity')->default(1);
            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->string('image_path')->nullable();
            $table->string('asset_name')->nullable();
            $table->integer('warranty_months')->nullable();
            $table->string('order_number')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('eol_date')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->decimal('purchase_cost', 15, 2)->nullable();
            $table->foreignId('status_label_id')->nullable()->constrained('status_labels')->nullOnDelete();
            $table->json('metadata')->nullable();
        });
    }
};
