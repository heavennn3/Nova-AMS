import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Logs() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Audit Logging" />
            <div className="flex items-center">
                <ShieldAlert className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Audit Logging</h1>
            </div>
            <p className="text-muted-foreground">Review system access attempts, privilege escalations, and API calls.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ShieldAlert className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Log Viewer Initializing</p>
                    <p className="text-muted-foreground text-sm mt-2">Syncing with SIEM provider...</p>
                </CardContent>
            </Card>
        </div>
    );
}

Logs.layout = {
    breadcrumbs: [
        {
            title: 'Audit Logging',
            href: '#',
        },
    ],
};
