import { Head } from '@inertiajs/react';
import { CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Costs() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Cost Analysis" />
            <div className="flex items-center">
                <CircleDollarSign className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Cost Analysis</h1>
            </div>
            <p className="text-muted-foreground">Break down maintenance, procurement, and operational costs.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <CircleDollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Financial Metrics Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Aggregate purchase orders and work order costs to generate reports.</p>
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
