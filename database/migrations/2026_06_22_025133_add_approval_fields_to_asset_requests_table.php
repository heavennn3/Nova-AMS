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
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('reason');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('admin_notes')->nullable()->after('approved_at');
            $table->timestamp('fulfilled_at')->nullable()->after('admin_notes');
            $table->timestamp('returned_at')->nullable()->after('fulfilled_at');
        });
    }

    public function down(): void
    {
        Schema::table('asset_requests', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['approved_by', 'approved_at', 'admin_notes', 'fulfilled_at', 'returned_at']);
        });
    }
};
