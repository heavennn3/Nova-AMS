import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Portal() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Vendor Portal Integration" />
            <div className="flex items-center">
                <Globe className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Vendor Portal
                </h1>
            </div>
            <p className="text-muted-foreground">
                External gateway for vendors to submit invoices, update
                statuses, and communicate.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Globe className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Portal Settings Restricted
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Vendor external access is currently disabled by system
                        administration.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Portal.layout = {
    breadcrumbs: [
        {
            title: 'Vendor Portal Integration',
            href: '#',
        },
    ],
};
