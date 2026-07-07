<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class IpoNotification extends Notification
{
    use Queueable;

    public $title;
    public $body;
    public $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($title, $body, $actionUrl = '/')
    {
        $this->title = $title;
        $this->body = $body;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title($this->title)
            ->icon('/logo.png')
            ->body($this->body)
            ->action('Cek Sekarang', $this->actionUrl)
            ->options(['TTL' => 1000])
            ->data(['url' => $this->actionUrl]);
    }
}
