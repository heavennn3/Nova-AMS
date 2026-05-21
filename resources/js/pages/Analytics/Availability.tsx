import { Head } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Availability() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Availability Metrics" />
            <div className="flex items-center">
                <CheckCircle className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Availability Metrics
                </h1>
            </div>
            <p className="text-muted-foreground">
                Track uptime percentages and scheduled downtimes.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <CheckCircle className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Uptime Tracking Pending
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Configure asset statuses to calculate historical
                        availability.
                    </p>
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
