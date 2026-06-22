<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class LicenseFulfilledNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $licenseName;
    protected $productKey;
    protected $requestNumber;

    public function __construct(string $licenseName, ?string $productKey, string $requestNumber)
    {
        $this->licenseName = $licenseName;
        $this->productKey = $productKey;
        $this->requestNumber = $requestNumber;
    }

    public function via($notifiable)
    {
        return ['database', 'mail', 'broadcast'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
            ->subject('Software License Approved — ' . $this->licenseName)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your software license request **' . $this->requestNumber . '** has been approved.')
            ->line('**License:** ' . $this->licenseName);

        if ($this->productKey) {
            $mail->line('**Product Key:** `' . $this->productKey . '`');
        }

        $mail->line('You can also view this in your request history.')
            ->action('View My Requests', url('/requests'))
            ->line('If you have any issues, please contact your IT administrator.');

        return $mail;
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title'   => 'License Assigned',
            'message' => "Your license for {$this->licenseName} has been assigned." . ($this->productKey ? " Key: {$this->productKey}" : ''),
            'type'    => 'license',
            'link'    => '/requests',
        ]);
    }

    public function toArray($notifiable)
    {
        return [
            'title'          => 'License Assigned',
            'message'        => "Your license for {$this->licenseName} has been assigned.",
            'type'           => 'license',
            'license_name'   => $this->licenseName,
            'product_key'    => $this->productKey,
            'request_number' => $this->requestNumber,
            'link'           => '/requests',
        ];
    }
}
