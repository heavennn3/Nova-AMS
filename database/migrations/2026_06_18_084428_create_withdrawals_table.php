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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('withdrawal_type')->default('standard'); // standard, temporary, permanent, maintenance
            $table->string('purpose_category'); // operational, project, maintenance, personal, emergency
            $table->text('purpose_description');
            $table->date('withdrawal_date');
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();
            $table->string('duration')->nullable(); // e.g., "7 days", "permanent"
            $table->string('status')->default('active'); // active, returned, overdue, lost, damaged
            $table->text('condition_notes')->nullable();
            $table->text('return_condition')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['asset_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('withdrawal_date');
            $table->index('expected_return_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
