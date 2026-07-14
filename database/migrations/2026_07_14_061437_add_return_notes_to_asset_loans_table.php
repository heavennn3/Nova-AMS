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
        Schema::table('asset_loans', function (Blueprint $table) {
            $table->text('return_notes')->nullable()->after('return_proof_path');
            $table->timestamp('return_requested_at')->nullable()->after('return_proof_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_loans', function (Blueprint $table) {
            $table->dropColumn(['return_notes', 'return_requested_at']);
        });
    }
};
