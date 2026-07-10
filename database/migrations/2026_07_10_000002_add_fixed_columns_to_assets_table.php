<?php

use App\Models\Asset;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('asset_categories')->nullOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('asset_types')->nullOnDelete();
            $table->foreignId('oem_id')->nullable()->constrained('oems')->nullOnDelete();
            $table->string('location')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('asset_name')->nullable();
            $table->year('purchase_year')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('part_number')->nullable();
        });

        // Migrate existing EAV data to hardcoded columns
        $fixedKeys = [
            'category_id', 'type_id', 'oem_id', 'location', 'quantity',
            'asset_name', 'purchase_year', 'serial_number', 'part_number',
        ];

        $chunkSize = 100;
        Asset::with(['fieldValues' => fn($q) => $q->whereIn('column_key', $fixedKeys)])
            ->chunkById($chunkSize, function ($assets) use ($fixedKeys) {
                foreach ($assets as $asset) {
                    $updates = [];
                    $deleteIds = [];
                    foreach ($asset->fieldValues as $fv) {
                        $key = $fv->column_key;
                        $value = $fv->value;

                        // Cast types
                        if ($key === 'quantity') {
                            $value = (int) $value;
                        } elseif ($key === 'purchase_year') {
                            $value = $value ? (int) $value : null;
                        } elseif (in_array($key, ['category_id', 'type_id', 'oem_id'])) {
                            $value = $value ? (int) $value : null;
                        }

                        $updates[$key] = $value;
                        $deleteIds[] = $fv->id;
                    }

                    if (!empty($updates)) {
                        DB::table('assets')->where('id', $asset->id)->update($updates);
                    }

                    if (!empty($deleteIds)) {
                        DB::table('asset_field_values')->whereIn('id', $deleteIds)->delete();
                    }
                }
            });
    }

    public function down(): void
    {
        // No automatic data restore — too destructive to reverse reliably.
        // Manually re-seed from backup if needed.
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['type_id']);
            $table->dropForeign(['oem_id']);
            $table->dropColumn([
                'category_id', 'type_id', 'oem_id', 'location',
                'quantity', 'asset_name', 'purchase_year',
                'serial_number', 'part_number',
            ]);
        });
    }
};
