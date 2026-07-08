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
        // Drop tables for removed features
        Schema::dropIfExists('work_orders');
        Schema::dropIfExists('maintenance_schedules');
        Schema::dropIfExists('pm_schedules');
        Schema::dropIfExists('technician_assignments');
        Schema::dropIfExists('vendor_performances');
        Schema::dropIfExists('vendor_slas');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('checkouts');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('withdrawals');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Reversing this migration would require recreating complex table structures
        // which are not included here as these features are being permanently removed
    }
};
