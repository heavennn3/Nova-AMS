import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function History() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Maintenance History" />
            <div className="flex items-center">
                <Globe className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance History</h1>
            </div>
            <p className="text-muted-foreground">Review past work, closed tickets, and historical repair logs.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">History Log Empty</p>
                    <p className="text-muted-foreground text-sm mt-2">No historical data available for the selected timeframe.</p>
                </CardContent>
            </Card>
        </div>
    );
}

History.layout = {
    breadcrumbs: [
        {
            title: 'Maintenance History',
            href: '#',
        },
    ],
};
