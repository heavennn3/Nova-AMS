<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class NotificationApiController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return response()->json([
            'notifications' => $user->notifications()->latest()->limit(20)->get(),
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead($id)
    {
        auth()->user()
            ->notifications()
            ->where('id', $id)
            ->first()?->markAsRead();

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All marked as read']);
    }
}
