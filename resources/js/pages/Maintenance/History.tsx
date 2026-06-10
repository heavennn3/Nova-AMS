import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function History() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Maintenance History" />
            <div className="flex items-center">
                <Globe className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Maintenance History
                </h1>
            </div>
            

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Globe className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">History Log Empty</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        No historical data available for the selected timeframe.
                    </p>
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
