import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Status() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Status Tracking" />
            <div className="flex items-center">
                <Activity className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Status Tracking</h1>
            </div>
            <p className="text-muted-foreground">Monitor real-time operational states and historical transitions for all assets.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Activity className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Status Anomalies Detected</p>
                    <p className="text-muted-foreground text-sm mt-2">All tracked assets are currently operating within expected parameters.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Status.layout = {
    breadcrumbs: [
        {
            title: 'Asset Status Tracking',
            href: '#',
        },
    ],
};
