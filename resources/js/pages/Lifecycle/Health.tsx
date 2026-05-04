import { Head } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Health() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Health Scoring" />
            <div className="flex items-center">
                <HeartPulse className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Scoring</h1>
            </div>
            <p className="text-muted-foreground">Predictive analysis of asset lifespan, risk of failure, and overall operational health.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <HeartPulse className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Insufficient Telemetry Data</p>
                    <p className="text-muted-foreground text-sm mt-2">Aggregate more maintenance logs and operational data to calculate accurate health scores.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Health.layout = {
    breadcrumbs: [
        {
            title: 'Health Scoring',
            href: '#',
        },
    ],
};
