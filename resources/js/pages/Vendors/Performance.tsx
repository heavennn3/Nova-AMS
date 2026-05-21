import { Head } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Performance() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Performance Tracking" />
            <div className="flex items-center">
                <Briefcase className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Vendor Performance Tracking
                </h1>
            </div>
            <p className="text-muted-foreground">
                Monitor vendor KPIs, service quality, and contract adherence.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Briefcase className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Insufficient Data</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Log vendor interactions and complete reviews to generate
                        scorecards.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Performance.layout = {
    breadcrumbs: [
        {
            title: 'Performance Tracking',
            href: '#',
        },
    ],
};
