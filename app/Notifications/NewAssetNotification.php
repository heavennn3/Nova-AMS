<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewAssetNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $asset;
    protected $userName;

    public function __construct($asset, $userName)
    {
        $this->asset = $asset;
        $this->userName = $userName;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title'   => 'New Asset Registered',
            'message' => "{$this->userName} has registered a new asset: {$this->asset->product_name}",
            'type'    => 'asset',
            'link'    => "/assets/{$this->asset->id}/edit",
        ]);
    }

    public function toArray($notifiable)
    {
        return [
            'title'   => 'New Asset Registered',
            'message' => "{$this->userName} has registered a new asset: {$this->asset->product_name}",
            'type'    => 'asset',
            'link'    => "/assets/{$this->asset->id}/edit",
        ];
    }
}
