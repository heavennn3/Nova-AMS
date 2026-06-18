<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Http\Kernel::class)->bootstrap();

// Log in the admin user
$user = \App\Models\User::where('email', 'admin@nova-ams.com')->first();
if (!$user) {
    echo "Admin user not found\n";
    exit(1);
}
auth()->login($user);

// Dispatch a request to /licenses
$request = \Illuminate\Http\Request::create('/licenses', 'GET');
$response = Route::dispatch($request);

// Print the content
echo $response->getContent();
