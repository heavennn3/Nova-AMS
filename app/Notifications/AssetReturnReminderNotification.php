<?php

namespace App\Notifications;

use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AssetReturnReminderNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        private readonly ?Asset $asset,
        private readonly string $assetName,
        private readonly string $expectedReturnDate,
        private readonly int $daysOverdue,
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    public function toArray($notifiable): array
    {
        return $this->payload();
    }

    private function payload(): array
    {
        return [
            'title' => 'Asset Return Reminder',
            'message' => "Please return {$this->assetName}. Expected return date: {$this->expectedReturnDate}. {$this->daysOverdue} day(s) overdue.",
            'type' => 'asset-reminder',
            'link' => $this->asset ? "/assets/{$this->asset->id}" : '/asset-track',
        ];
    }
}
