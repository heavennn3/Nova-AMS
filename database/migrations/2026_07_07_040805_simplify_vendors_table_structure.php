<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            // Remove unnecessary columns
            $table->dropColumn([
                'contact_person',
                'phone', 
                'email',
                'logo',
                'address'
            ]);
            
            // Add description column
            $table->text('description')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            // Add back the removed columns
            $table->string('contact_person')->nullable()->after('name');
            $table->string('phone', 50)->nullable()->after('contact_person');
            $table->string('email')->nullable()->after('phone');
            $table->string('logo')->nullable()->after('email');
            $table->text('address')->nullable()->after('logo');
            
            // Remove description column
            $table->dropColumn('description');
        });
    }
};