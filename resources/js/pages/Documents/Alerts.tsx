import { Head } from '@inertiajs/react';
import { BellRing } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Alerts() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Expiration Alerts" />
            <div className="flex items-center">
                <BellRing className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Document Expiration Alerts
                </h1>
            </div>
            <p className="text-muted-foreground">
                Monitor expiring compliance certificates and licenses.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <BellRing className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Pending Alerts</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        All documents are up-to-date and compliant.
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
