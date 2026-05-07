import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Utilization() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Asset Utilization" />
            <div className="flex items-center">
                <Activity className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Utilization</h1>
            </div>
            <p className="text-muted-foreground">Monitor how frequently and efficiently assets are being used.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Activity className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Utilization Data</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect IoT sensors or manual check-in logs to track usage.</p>
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
