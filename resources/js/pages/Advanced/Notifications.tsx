import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Notifications() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Notifications" />
            <div className="flex items-center">
                <Bell className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications Configuration</h1>
            </div>
            <p className="text-muted-foreground">Set up Email, SMS, and Push notification triggers for critical system events.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Gateways Configured</p>
                    <p className="text-muted-foreground text-sm mt-2">Integrate Twilio or SMTP to enable real-time alerting.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Notifications.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: '#',
        },
    ],
};
