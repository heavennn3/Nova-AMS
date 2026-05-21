import { Head } from '@inertiajs/react';
import { Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Budgets() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Budget Tracking" />
            <div className="flex items-center">
                <Wallet className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Budget Tracking
                </h1>
            </div>
            <p className="text-muted-foreground">
                Monitor departmental expenditures and capital expenditure
                limits.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Wallet className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Budgets Allocated</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Setup fiscal year parameters to begin tracking.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Budgets.layout = {
    breadcrumbs: [
        {
            title: 'Budget Tracking',
            href: '#',
        },
    ],
};
