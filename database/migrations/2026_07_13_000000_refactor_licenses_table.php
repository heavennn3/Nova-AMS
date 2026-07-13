<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('licenses', function (Blueprint $table) {
            // --- Step 1: Rename existing columns ---
            if (Schema::hasColumn('licenses', 'product_key') && !Schema::hasColumn('licenses', 'license_key')) {
                $table->renameColumn('product_key', 'license_key');
            }
            if (Schema::hasColumn('licenses', 'expiration_date') && !Schema::hasColumn('licenses', 'end_date')) {
                $table->renameColumn('expiration_date', 'end_date');
            }
            if (Schema::hasColumn('licenses', 'total_seats') && !Schema::hasColumn('licenses', 'total_seat')) {
                $table->renameColumn('total_seats', 'total_seat');
            }
            if (Schema::hasColumn('licenses', 'used_seats') && !Schema::hasColumn('licenses', 'used_seat')) {
                $table->renameColumn('used_seats', 'used_seat');
            }
            if (Schema::hasColumn('licenses', 'license_type') && !Schema::hasColumn('licenses', 'type')) {
                $table->renameColumn('license_type', 'type');
            }

            // --- Step 2: Drop unused columns ---
            $dropColumns = [
                'seats', 'purchase_cost', 'purchase_date', 'support_expiry',
                'renewal_date', 'auto_renew', 'subscription_id', 'billing_cycle',
                'compliance_status', 'last_audit_date', 'notification_days',
                'license_email', 'license_name', 'delete_reason', 'version',
                'pricing_model', 'available_seats',
            ];
            foreach ($dropColumns as $col) {
                if (Schema::hasColumn('licenses', $col)) {
                    $table->dropColumn($col);
                }
            }

            // Drop old vendor_id FK + column
            if (Schema::hasColumn('licenses', 'vendor_id')) {
                $table->dropForeign(['vendor_id']);
                $table->dropColumn('vendor_id');
            }

            // --- Step 3: Add new columns ---
            if (!Schema::hasColumn('licenses', 'oem_id')) {
                $table->foreignId('oem_id')->nullable()->constrained('oems')->nullOnDelete();
            }
            if (!Schema::hasColumn('licenses', 'active_date')) {
                $table->date('active_date')->nullable();
            }
            if (!Schema::hasColumn('licenses', 'duration_months')) {
                $table->integer('duration_months')->nullable();
            }
            if (!Schema::hasColumn('licenses', 'status')) {
                $table->string('status', 50)->default('available');
            }
        });
    }

    public function down(): void
    {
        // Reverse: add back columns (no-op for safety on production data)
        // This is intentionally minimal — reversing schema is complex.
    }
};
