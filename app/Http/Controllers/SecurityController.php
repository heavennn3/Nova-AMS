<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use OwenIt\Auditing\Models\Audit;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function logs(Request $request) 
    { 
        $query = Audit::with('user')->latest();

        // Filtering
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }
        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', 'LIKE', '%' . $request->auditable_type . '%');
        }

        $logs = $query->get()->map(function($audit) {
            return [
                'id' => $audit->id,
                'user_name' => $audit->user->name ?? 'System',
                'event' => $audit->event,
                'auditable_type' => class_basename($audit->auditable_type),
                'old_values' => $audit->old_values,
                'new_values' => $audit->new_values,
                'ip_address' => $audit->ip_address,
                'user_agent' => $audit->user_agent,
                'created_at' => $audit->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Security/Logs', [
            'logs' => $logs
        ]); 
    }
}
