import { Head } from '@inertiajs/react';
import { LineChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Predictive() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Predictive Analytics" />
            <div className="flex items-center">
                <LineChart className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Predictive Analytics
                </h1>
            </div>
            <p className="text-muted-foreground">
                Forecast failures and optimize maintenance schedules using AI
                algorithms.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <LineChart className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Training AI Models</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gathering historical failure data to build accurate
                        predictive matrices.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Predictive.layout = {
    breadcrumbs: [
        {
            title: 'Predictive Analytics',
            href: '#',
        },
    ],
};
