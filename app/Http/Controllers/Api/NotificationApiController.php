<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;

class NotificationApiController extends Controller
{
    public function index()
    {
        return response()->json(
            Notification::where('user_id', auth()->id())
                ->latest()
                ->limit(20)
                ->get()
        );
    }

    public function markAsRead($id)
    {
        Notification::where('user_id', auth()->id())->where('id', $id)->update(['read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())->update(['read' => true]);
        return response()->json(['message' => 'All marked as read']);
    }
}
