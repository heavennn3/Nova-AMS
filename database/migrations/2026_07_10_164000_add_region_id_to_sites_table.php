<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add region_id FK
        Schema::table('sites', function (Blueprint $table) {
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete()->after('name');
        });

        // Migrate existing region string values to region_id
        $regions = DB::table('regions')->pluck('id', 'name');
        DB::table('sites')->orderBy('id')->each(function ($site) use ($regions) {
            if ($site->region) {
                $regionName = ucfirst(strtolower(trim($site->region)));
                $regionId = $regions[$regionName] ?? null;
                if ($regionId) {
                    DB::table('sites')->where('id', $site->id)->update(['region_id' => $regionId]);
                }
            }
        });

        // Drop old region string column
        Schema::table('sites', function (Blueprint $table) {
            $table->dropColumn('region');
        });
    }

    public function down(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            $table->string('region')->nullable()->after('name');
        });

        // Restore region string values back
        DB::table('sites')->orderBy('id')->each(function ($site) {
            if ($site->region_id) {
                $regionName = DB::table('regions')->where('id', $site->region_id)->value('name');
                if ($regionName) {
                    DB::table('sites')->where('id', $site->id)->update(['region' => strtolower($regionName)]);
                }
            }
        });

        Schema::table('sites', function (Blueprint $table) {
            $table->dropConstrainedForeignId('region_id');
        });
    }
};
