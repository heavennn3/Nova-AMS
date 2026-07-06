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
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->date('loan_date')->nullable()->after('required_until');
            $table->date('expected_return_date')->nullable()->after('loan_date');
            $table->string('condition_status')->nullable()->after('expected_return_date');
            $table->text('purpose')->nullable()->after('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropColumn(['loan_date', 'expected_return_date', 'condition_status', 'purpose']);
        });
    }
};
