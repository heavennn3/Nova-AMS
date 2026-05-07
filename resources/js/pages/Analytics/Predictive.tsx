import { Head } from '@inertiajs/react';
import { LineChart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Predictive() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Predictive Analytics" />
            <div className="flex items-center">
                <LineChart className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Predictive Analytics</h1>
            </div>
            <p className="text-muted-foreground">Forecast failures and optimize maintenance schedules using AI algorithms.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <LineChart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Training AI Models</p>
                    <p className="text-muted-foreground text-sm mt-2">Gathering historical failure data to build accurate predictive matrices.</p>
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
