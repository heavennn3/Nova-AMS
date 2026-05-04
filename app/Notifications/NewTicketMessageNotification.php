<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewTicketMessageNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $ticket;
    protected $messageText;
    protected $senderName;

    public function __construct($ticket, $messageText, $senderName)
    {
        $this->ticket = $ticket;
        $this->messageText = $messageText;
        $this->senderName = $senderName;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title'   => 'New Message',
            'message' => "{$this->senderName}: " . substr($this->messageText, 0, 50),
            'type'    => 'chat',
            'link'    => "/support/tickets",
            'ticket_id' => $this->ticket->id,
        ]);
    }

    public function toArray($notifiable)
    {
        return [
            'title'   => 'New Message',
            'message' => "{$this->senderName}: " . substr($this->messageText, 0, 50),
            'type'    => 'chat',
            'link'    => "/support/tickets",
            'ticket_id' => $this->ticket->id,
        ];
    }
}
