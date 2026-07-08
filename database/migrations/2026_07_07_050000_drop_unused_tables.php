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
        // First, drop foreign keys that reference tables we're about to drop
        Schema::table('licenses', function (Blueprint $table) {
            $table->dropForeign(['license_type_id']);
        });

        // Drop unused tables that have no models or are not referenced in the current system
        Schema::dropIfExists('maintenance_records');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('audit_logs'); // Replaced by 'audits' table
        Schema::dropIfExists('work_orders'); // Related to removed Operations module
        Schema::dropIfExists('checkouts'); // Not being used
        Schema::dropIfExists('license_types'); // No model exists
        Schema::dropIfExists('license_usage_logs'); // No model exists
        
        // Remove the license_type_id column from licenses table since the referenced table is gone
        Schema::table('licenses', function (Blueprint $table) {
            $table->dropColumn('license_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration cannot be fully reversed as the original table structures
        // would need to be recreated. If you need to restore these tables, refer to the
        // original migration file: 2026_05_02_072129_create_advanced_ams_tables.php
        
        // Optionally recreate empty tables (without data):
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('maintenance_type');
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->string('performed_by')->nullable();
            $table->decimal('cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('contract_number')->unique();
            $table->string('contract_type');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('contract_value', 12, 2)->nullable();
            $table->text('terms')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->date('order_date');
            $table->date('expected_delivery')->nullable();
            $table->string('status');
            $table->decimal('total_amount', 12, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('old_values')->nullable();
            $table->text('new_values')->nullable();
            $table->timestamps();
        });

        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('priority')->default('medium');
            $table->string('status')->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('due_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('checkouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('checked_out_at');
            $table->timestamp('expected_checkin_at')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('license_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('license_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained('licenses')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('used_at');
            $table->string('action');
            $table->timestamps();
        });
    }
};