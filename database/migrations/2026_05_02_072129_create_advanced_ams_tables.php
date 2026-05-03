<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->string('region')->nullable();
            $table->timestamps();
        });


        Schema::table('assets', function (Blueprint $table) {

            $table->foreignId('site_id')->nullable()->constrained('sites')->nullOnDelete();
            

            $table->integer('quantity')->default(1)->after('location_id');

            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->decimal('salvage_value', 15, 2)->nullable();
            $table->integer('useful_life_years')->nullable();
            $table->date('warranty_expiry_date')->nullable();
            $table->string('insurance_policy_number')->nullable();
            $table->decimal('health_score', 5, 2)->nullable()->comment('AI-based condition assessment score');
            $table->string('barcode_path')->nullable();
        });


        Schema::create('asset_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('from_site_id')->nullable()->constrained('sites')->nullOnDelete();
            $table->foreignId('to_site_id')->constrained('sites')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->timestamp('transfer_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });


        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('part_number')->unique();
            $table->integer('stock_level')->default(0);
            $table->integer('minimum_stock_level')->default(0);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->foreignId('site_id')->nullable()->constrained('sites')->cascadeOnDelete();
            $table->timestamps();
        });


        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
            $table->foreignId('technician_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['preventive', 'corrective']);
            $table->text('action_taken');
            $table->decimal('cost', 10, 2)->nullable();
            $table->timestamp('performed_at');
            $table->timestamps();
        });


        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('contract_name');
            $table->string('contract_number')->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('value', 15, 2)->nullable();
            $table->text('sla_details')->nullable();
            $table->enum('status', ['active', 'expired', 'terminated'])->default('active');
            $table->timestamps();
        });


        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            $table->morphs('documentable'); 
            $table->string('file_name');
            $table->string('file_path');
            $table->string('document_type')->comment('Manual, Certificate, Invoice, etc.');
            $table->date('expires_at')->nullable()->comment('License/certificate renewal notifications');
            $table->string('version')->default('1.0');
            $table->timestamps();
        });

        // 8. PURCHASE ORDERS (Vendor Management & Financial)
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('vendor_id')->constrained('vendors');
            $table->foreignId('requested_by')->constrained('users');
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['draft', 'submitted', 'approved', 'fulfilled', 'cancelled'])->default('draft');
            $table->timestamps();
        });

        // 9. AUDIT LOGS (Track all user actions / Complete history of asset movements)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // created, updated, deleted, status_changed
            $table->morphs('auditable');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('maintenance_records');
        Schema::dropIfExists('spare_parts');
        Schema::dropIfExists('asset_transfers');
        
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['site_id']);
            $table->dropColumn([
                'site_id', 'quantity', 'purchase_price', 'salvage_value', 'useful_life_years', 
                'warranty_expiry_date', 'insurance_policy_number', 'health_score', 'barcode_path'
            ]);
        });

        Schema::dropIfExists('sites');
    }
};
