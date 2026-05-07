import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Availability() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Availability Metrics" />
            <div className="flex items-center">
                <CheckCircle className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Availability Metrics</h1>
            </div>
            <p className="text-muted-foreground">Track uptime percentages and scheduled downtimes.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Uptime Tracking Pending</p>
                    <p className="text-muted-foreground text-sm mt-2">Configure asset statuses to calculate historical availability.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Availability.layout = {
    breadcrumbs: [
        {
            title: 'Availability Metrics',
            href: '#',
        },
    ],
};
