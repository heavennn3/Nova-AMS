<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create suppliers table if not exists
        if (!Schema::hasTable('suppliers')) {
            Schema::create('suppliers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->text('address')->nullable();
                $table->timestamps();
            });
        }

        // 2. Create status_labels table if not exists
        if (!Schema::hasTable('status_labels')) {
            Schema::create('status_labels', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('type')->default('deployable')->comment('pending, deployable, archived, undeployable');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 3. Modify assets table
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'image_path')) {
                $table->string('image_path')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('assets', 'asset_name')) {
                $table->string('asset_name')->nullable()->after('product_name');
            }
            if (!Schema::hasColumn('assets', 'warranty_months')) {
                $table->integer('warranty_months')->nullable()->after('image_path');
            }
            if (!Schema::hasColumn('assets', 'order_number')) {
                $table->string('order_number')->nullable()->after('warranty_months');
            }
            if (!Schema::hasColumn('assets', 'purchase_date')) {
                $table->date('purchase_date')->nullable()->after('order_number');
            }
            if (!Schema::hasColumn('assets', 'eol_date')) {
                $table->date('eol_date')->nullable()->after('purchase_date');
            }
            if (!Schema::hasColumn('assets', 'supplier_id')) {
                $table->foreignId('supplier_id')->nullable()->after('eol_date')->constrained('suppliers')->nullOnDelete();
            }
            if (!Schema::hasColumn('assets', 'purchase_cost')) {
                $table->decimal('purchase_cost', 15, 2)->nullable()->after('supplier_id');
            }
            if (!Schema::hasColumn('assets', 'status_label_id')) {
                $table->foreignId('status_label_id')->nullable()->after('status')->constrained('status_labels')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropForeign(['status_label_id']);
            $table->dropColumn([
                'image_path',
                'asset_name',
                'warranty_months',
                'order_number',
                'purchase_date',
                'eol_date',
                'supplier_id',
                'purchase_cost',
                'status_label_id'
            ]);
        });

        Schema::dropIfExists('status_labels');
        Schema::dropIfExists('suppliers');
    }
};
