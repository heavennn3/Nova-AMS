<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Using raw SQL for enum updates as it's more reliable for MySQL
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('available', 'in_use', 'maintenance', 'faulty', 'retired', 'degraded', 'new') DEFAULT 'available'");
        DB::statement("ALTER TABLE assets MODIFY COLUMN condition_status ENUM('new', 'excellent', 'good', 'fair', 'degraded', 'poor', 'faulty', 'damaged') DEFAULT 'good'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('available', 'in_use', 'maintenance', 'faulty', 'retired') DEFAULT 'available'");
        DB::statement("ALTER TABLE assets MODIFY COLUMN condition_status ENUM('good', 'fair', 'poor', 'damaged') DEFAULT 'good'");
    }
};
