<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Enhance licenses table
        Schema::table('licenses', function (Blueprint $table) {
            // License type and pricing model
            if (!Schema::hasColumn('licenses', 'license_type')) {
                $table->enum('license_type', ['per_user', 'per_device', 'concurrent', 'subscription', 'perpetual'])->default('perpetual')->after('name');
            }

            if (!Schema::hasColumn('licenses', 'pricing_model')) {
                $table->enum('pricing_model', ['one_time', 'annual', 'monthly', 'quarterly'])->default('one_time')->after('license_type');
            }

            // Enhanced seat management
            if (!Schema::hasColumn('licenses', 'total_seats')) {
                $table->integer('total_seats')->default(1)->after('pricing_model');
            }

            if (!Schema::hasColumn('licenses', 'used_seats')) {
                $table->integer('used_seats')->default(0)->after('total_seats');
            }

            if (!Schema::hasColumn('licenses', 'available_seats')) {
                $table->integer('available_seats')->default(1)->after('used_seats');
            }

            // Renewal and subscription management
            if (!Schema::hasColumn('licenses', 'renewal_date')) {
                $table->date('renewal_date')->nullable()->after('expiration_date');
            }

            if (!Schema::hasColumn('licenses', 'auto_renew')) {
                $table->boolean('auto_renew')->default(false)->after('renewal_date');
            }

            if (!Schema::hasColumn('licenses', 'subscription_id')) {
                $table->string('subscription_id')->nullable()->after('auto_renew');
            }

            if (!Schema::hasColumn('licenses', 'billing_cycle')) {
                $table->enum('billing_cycle', ['monthly', 'quarterly', 'annual', 'custom'])->nullable()->after('subscription_id');
            }

            // Compliance and usage tracking
            if (!Schema::hasColumn('licenses', 'compliance_status')) {
                $table->enum('compliance_status', ['compliant', 'non_compliant', 'expiring_soon', 'expired'])->default('compliant')->after('billing_cycle');
            }

            if (!Schema::hasColumn('licenses', 'last_audit_date')) {
                $table->date('last_audit_date')->nullable()->after('compliance_status');
            }

            // Additional details
            if (!Schema::hasColumn('licenses', 'version')) {
                $table->string('version')->nullable()->after('product_key');
            }

            if (!Schema::hasColumn('licenses', 'category')) {
                $table->string('category')->nullable()->after('version');
            }

            if (!Schema::hasColumn('licenses', 'support_expiry')) {
                $table->date('support_expiry')->nullable()->after('expiration_date');
            }

            if (!Schema::hasColumn('licenses', 'notification_days')) {
                $table->integer('notification_days')->default(30)->after('support_expiry');
            }
        });

        // Add asset relationships to license_seats
        Schema::table('license_seats', function (Blueprint $table) {
            if (!Schema::hasColumn('license_seats', 'seat_status')) {
                $table->enum('seat_status', ['available', 'assigned', 'suspended', 'revoked'])->default('available')->after('seat_number');
            }

            if (!Schema::hasColumn('license_seats', 'assignment_type')) {
                $table->enum('assignment_type', ['user', 'device', 'concurrent'])->nullable()->after('seat_status');
            }

            if (!Schema::hasColumn('license_seats', 'last_used')) {
                $table->timestamp('last_used')->nullable()->after('assigned_at');
            }

            if (!Schema::hasColumn('license_seats', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable()->after('last_used');
            }
        });

        // Create license assignments table for tracking usage history
        if (!Schema::hasTable('license_assignments')) {
            Schema::create('license_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('license_id')->constrained('licenses')->cascadeOnDelete();
                $table->foreignId('license_seat_id')->nullable()->constrained('license_seats')->nullOnDelete();
                $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('assigned_to_asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->enum('assignment_type', ['user', 'device', 'concurrent']);
                $table->timestamp('assigned_at');
                $table->timestamp('revoked_at')->nullable();
                $table->text('assignment_notes')->nullable();
                $table->foreignId('revoked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['license_id', 'assigned_at']);
                $table->index(['assigned_to_user_id', 'assigned_at']);
                $table->index(['assigned_to_asset_id', 'assigned_at']);
            });
        }

        // Create license renewals table
        if (!Schema::hasTable('license_renewals')) {
            Schema::create('license_renewals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('license_id')->constrained('licenses')->cascadeOnDelete();
                $table->date('previous_expiration');
                $table->date('new_expiration');
                $table->decimal('renewal_cost', 15, 2)->nullable();
                $table->enum('renewal_type', ['automatic', 'manual', 'upgrade', 'downgrade']);
                $table->text('notes')->nullable();
                $table->foreignId('renewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['license_id', 'new_expiration']);
            });
        }

        // Create license usage logs table for concurrent tracking
        if (!Schema::hasTable('license_usage_logs')) {
            Schema::create('license_usage_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('license_id')->constrained('licenses')->cascadeOnDelete();
                $table->foreignId('license_seat_id')->nullable()->constrained('license_seats')->nullOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('asset_id')->nullable()->constrained('assets')->nullOnDelete();
                $table->timestamp('session_start');
                $table->timestamp('session_end')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->timestamps();

                $table->index(['license_id', 'session_start']);
                $table->index(['user_id', 'session_start']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('license_usage_logs');
        Schema::dropIfExists('license_renewals');
        Schema::dropIfExists('license_assignments');

        Schema::table('license_seats', function (Blueprint $table) {
            $table->dropColumn(['seat_status', 'assignment_type', 'last_used', 'revoked_at']);
        });

        Schema::table('licenses', function (Blueprint $table) {
            $table->dropColumn([
                'license_type', 'pricing_model', 'total_seats', 'used_seats', 'available_seats',
                'renewal_date', 'auto_renew', 'subscription_id', 'billing_cycle',
                'compliance_status', 'last_audit_date', 'version', 'category',
                'support_expiry', 'notification_days'
            ]);
        });
    }
};