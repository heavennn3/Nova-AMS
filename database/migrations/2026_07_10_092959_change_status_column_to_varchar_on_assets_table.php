<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->string('status', 100)->default('not_updated')->change();
        });
    }

    public function down(): void
    {
        // Can't reliably revert back to enum. Leave as string.
    }
};
