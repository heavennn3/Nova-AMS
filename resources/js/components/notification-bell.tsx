import { usePage } from '@inertiajs/react';
import {
    Bell,
    CheckCheck,
    Loader2,
    Package,
    AlertTriangle,
    Info,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
    id: string;
    data: {
        title: string;
        message: string;
        type: 'info' | 'asset' | 'alert';
        link?: string;
    };
    read_at: string | null;
    created_at: string;
}

export function NotificationBell() {
    const { props } = usePage();
    const auth = (props as any).auth;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!auth?.user) return;

        try {
            const res = await fetch('/api/notifications', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;

            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [auth?.user]);

    useEffect(() => {
        if (!auth?.user) return;

        fetchNotifications();

        if (typeof window !== 'undefined' && window.Echo) {
            // Listen for real-time notifications
            window.Echo.private(`App.Models.User.${auth.user.id}`).notification(
                (notification: any) => {
                    // Update state immediately
                    setUnreadCount((prev) => prev + 1);
                    setNotifications((prev) =>
                        [
                            {
                                id: notification.id,
                                data: notification,
                                read_at: null,
                                created_at: new Date().toISOString(),
                            },
                            ...prev,
                        ].slice(0, 10),
                    );

                    // Show a toast
                    toast(notification.title, {
                        description: notification.message,
                    });
                },
            );

            return () => {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            };
        }
    }, [auth.user?.id, fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);

        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });
            fetchNotifications();
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'asset':
                return <Package className="h-4 w-4 text-emerald-500" />;
            case 'alert':
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default:
                return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-muted/50"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-rose-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 border-border/50 p-0 shadow-xl"
            >
                <div className="flex items-center justify-between border-b bg-muted/10 p-4">
                    <h3 className="text-sm font-bold">Notifications</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] font-bold tracking-wider text-muted-foreground uppercase hover:text-primary"
                        onClick={(e) => {
                            e.preventDefault();
                            markAllAsRead();
                        }}
                        disabled={unreadCount === 0 || loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                            <CheckCheck className="mr-1 h-3 w-3" />
                        )}
                        Mark all as read
                    </Button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 opacity-10" />
                            <p className="text-xs font-medium">
                                No new notifications
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex cursor-pointer items-start gap-3 p-4 focus:bg-muted/50 ${!n.read_at ? 'bg-primary/5' : ''}`}
                                onClick={() => markAsRead(n.id)}
                            >
                                <div className="mt-1 rounded-full border border-border/50 bg-background p-1.5 shadow-sm">
                                    {getIcon(n.data.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={`text-xs leading-none font-bold ${!n.read_at ? 'text-foreground' : 'text-muted-foreground'}`}
                                        >
                                            {n.data.title}
                                        </p>
                                        <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                                            {new Date(
                                                n.created_at,
                                            ).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 text-[11px] leading-normal text-muted-foreground">
                                        {n.data.message}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="border-t p-2 text-center">
                        <Button
                            variant="ghost"
                            className="h-8 w-full text-[10px] font-bold text-muted-foreground uppercase"
                        >
                            View all history
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
