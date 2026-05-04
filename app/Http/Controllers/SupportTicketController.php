<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Admin');

        $query = SupportTicket::with(['user', 'assignedTo'])
            ->latest();

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Support/Tickets', [
            'tickets' => $query->get(),
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (Auth::user()->hasRole('Admin')) {
            return back()->withErrors(['error' => 'Administrators cannot create support tickets.']);
        }

        $validated = $request->validate([
            'subject'  => 'required|string|max:255',
            'category' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'message'  => 'required|string',
        ]);

        $ticket = SupportTicket::create([
            'user_id'  => Auth::id(),
            'subject'  => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status'   => 'open',
        ]);

        $ticket->messages()->create([
            'user_id' => Auth::id(),
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Ticket created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SupportTicket $ticket)
    {
        $user = Auth::user();
        if (!$user->hasRole('Admin') && $ticket->user_id !== $user->id) {
            abort(403);
        }

        return response()->json([
            'ticket'   => $ticket->load(['user', 'assignedTo']),
            'messages' => $ticket->messages()->with('user')->oldest()->get(),
        ]);
    }

    /**
     * Add a message to the ticket.
     */
    public function message(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();
        if (!$user->hasRole('Admin') && $ticket->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $msg = $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
        ]);

        // Trigger Notifications
        $isAdmin = $user->hasRole('Admin');
        if ($isAdmin) {
            // Notify the ticket owner
            $ticket->user->notify(new \App\Notifications\NewTicketMessageNotification($ticket, $msg->message, $user->name));
        } else {
            // Notify all Admins
            $admins = \App\Models\User::role('Admin')->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewTicketMessageNotification($ticket, $msg->message, $user->name));
        }

        // If user replies, and ticket is resolved/closed, maybe re-open it?
        if ($ticket->status === 'resolved' || $ticket->status === 'closed') {
            if ($ticket->user_id === $user->id) {
                $ticket->update(['status' => 'open']);
            }
        }

        return back()->with('success', 'Message sent.');
    }

    /**
     * Update ticket status.
     */
    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Admin');
        
        // Allow if admin OR if it's the user's own ticket
        if (!$isAdmin && $ticket->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status'      => 'required|in:open,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // Non-admins can only set status to 'resolved'
        if (!$isAdmin && $validated['status'] !== 'resolved') {
            abort(403, 'Users can only mark tickets as resolved.');
        }

        $ticket->update($validated);

        return back()->with('success', 'Ticket updated.');
    }
}
