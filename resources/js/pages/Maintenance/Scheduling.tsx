import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Scheduling() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Preventive Scheduling" />
            <div className="flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Preventive Scheduling</h1>
            </div>
            <p className="text-muted-foreground">Manage and automate routine maintenance checks across all facilities.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Calendar Module Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect your scheduling service to view upcoming PM (Preventive Maintenance) tasks.</p>
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
