import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Scheduling() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Preventive Scheduling" />
            <div className="flex items-center">
                <Calendar className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Preventive Scheduling
                </h1>
            </div>
            <p className="text-muted-foreground">
                Manage and automate routine maintenance checks across all
                facilities.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Calendar className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Calendar Module Offline
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect your scheduling service to view upcoming PM
                        (Preventive Maintenance) tasks.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Scheduling.layout = {
    breadcrumbs: [
        {
            title: 'Preventive Scheduling',
            href: '#',
        },
    ],
};
