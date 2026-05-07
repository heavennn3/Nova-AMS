import { Head } from '@inertiajs/react';
import { Wallet } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Budgets() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Budget Tracking" />
            <div className="flex items-center">
                <Wallet className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget Tracking</h1>
            </div>
            <p className="text-muted-foreground">Monitor departmental expenditures and capital expenditure limits.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Wallet className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Budgets Allocated</p>
                    <p className="text-muted-foreground text-sm mt-2">Setup fiscal year parameters to begin tracking.</p>
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
