import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Utilization() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Utilization" />
            <div className="flex items-center">
                <Activity className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Asset Utilization
                </h1>
            </div>
            <p className="text-muted-foreground">
                Monitor how frequently and efficiently assets are being used.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Activity className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Utilization Data</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect IoT sensors or manual check-in logs to track
                        usage.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Utilization.layout = {
    breadcrumbs: [
        {
            title: 'Asset Utilization',
            href: '#',
        },
    ],
};
