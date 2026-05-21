import { Head } from '@inertiajs/react';
import { CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Costs() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Cost Analysis" />
            <div className="flex items-center">
                <CircleDollarSign className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Cost Analysis
                </h1>
            </div>
            <p className="text-muted-foreground">
                Break down maintenance, procurement, and operational costs.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <CircleDollarSign className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Financial Metrics Offline
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Aggregate purchase orders and work order costs to
                        generate reports.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Costs.layout = {
    breadcrumbs: [
        {
            title: 'Cost Analysis',
            href: '#',
        },
    ],
};
