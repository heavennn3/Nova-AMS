<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        $writeAuthAudit = function (string $eventName, $user, array $newValues = []) {
            if (!$user) {
                return;
            }

            \OwenIt\Auditing\Models\Audit::create([
                'user_type' => get_class($user),
                'user_id' => $user->id,
                'event' => $eventName,
                'auditable_type' => get_class($user),
                'auditable_id' => $user->id,
                'old_values' => [],
                'new_values' => $newValues,
                'url' => request()->fullUrl(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        };

        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Login::class, fn ($event) => $writeAuthAudit('login', $event->user));
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Logout::class, fn ($event) => $writeAuthAudit('logout', $event->user));
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Failed::class, function ($event) use ($writeAuthAudit) {
            $user = $event->user ?: \App\Models\User::where('email', $event->credentials['email'] ?? null)->first();
            $writeAuthAudit('failed_login', $user, ['email' => $event->credentials['email'] ?? null]);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
