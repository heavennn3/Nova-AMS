import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Slas() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Service Level Agreements" />
            <div className="flex items-center">
                <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Service Level Agreements (SLAs)
                </h1>
            </div>
            <p className="text-muted-foreground">
                Track resolution times, uptime guarantees, and vendor compliance
                metrics.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ShieldCheck className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        No Active SLAs Tracked
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Configure SLA parameters for your active vendor
                        contracts to begin monitoring.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Slas.layout = {
    breadcrumbs: [
        {
            title: 'Service Level Agreements',
            href: '#',
        },
    ],
};
