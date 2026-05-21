import { Head } from '@inertiajs/react';
import { FileWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Alerts() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Expiration Alerts" />
            <div className="flex items-center">
                <FileWarning className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Expiration Alerts
                </h1>
            </div>
            <p className="text-muted-foreground">
                Stay ahead of contract renewals, expiring warranties, and
                license deadlines.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <FileWarning className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Pending Alerts</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        All vendor contracts and warranties are currently active
                        and far from expiration.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Alerts.layout = {
    breadcrumbs: [
        {
            title: 'Expiration Alerts',
            href: '#',
        },
    ],
};
