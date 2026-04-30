<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pm_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
            $table->string('maintenance_type')->nullable();
            $table->date('next_due_date')->nullable();
            $table->date('last_performed')->nullable();
            $table->integer('frequency_days')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'overdue'])->default('scheduled');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pm_schedules');
    }
};