<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('color', 50)->default('#6B7280'); // hex color for badge
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed defaults
        $now = now();
        $statuses = [
            ['name' => 'not_updated', 'color' => '#14B8A6', 'sort_order' => 1],
            ['name' => 'faulty',      'color' => '#EF4444', 'sort_order' => 2],
            ['name' => 'available',   'color' => '#22C55E', 'sort_order' => 4],
            ['name' => 'in_use',      'color' => '#3B82F6', 'sort_order' => 5],
            ['name' => 'repair',      'color' => '#F97316', 'sort_order' => 6],
        ];
        DB::table('asset_statuses')->insert(
            array_map(fn($s) => [...$s, 'created_at' => $now, 'updated_at' => $now], $statuses)
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_statuses');
    }
};
