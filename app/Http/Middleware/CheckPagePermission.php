<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPagePermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The CRUD permission to check (create, read, update, delete)
     * @param  string|null  $pageName  The page name to check permissions for
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $permission, string $pageName = null): Response
    {
        $user = auth()->user();

        // Allow access if user is admin
        if ($user && $user->hasRole('Admin')) {
            return $next($request);
        }

        // If no user or no authenticated user, deny access
        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to access this page.');
        }

        // If page name is not provided, try to derive it from the route
        if (!$pageName) {
            $pageName = $this->getPageNameFromRoute($request);
        }

        // Check if user has the required permission for the page
        if (!$user->hasPagePermission($pageName, $permission)) {
            $this->logDeniedAccess($user, $pageName, $permission, $request);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'You do not have permission to perform this action.',
                    'required_permission' => $permission,
                    'page' => $pageName,
                ], 403);
            }

            return back()->with('error', "You don't have {$permission} permission for {$pageName}.");
        }

        return $next($request);
    }

    /**
     * Derive page name from the current route
     */
    private function getPageNameFromRoute(Request $request): string
    {
        $route = $request->route();
        $uri = $route->uri();

        // Remove dynamic segments and convert to page name
        $pageName = str_replace(['{', '}', '/', '}, {'], '', $uri);

        // Handle specific route patterns
        if (preg_match('/^(\w+)\//', $uri, $matches)) {
            return $matches[1];
        }

        return $pageName;
    }

    /**
     * Log denied access attempts
     */
    private function logDeniedAccess($user, string $pageName, string $permission, Request $request): void
    {
        \Log::warning('Access denied', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'page' => $pageName,
            'required_permission' => $permission,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
        ]);
    }
}