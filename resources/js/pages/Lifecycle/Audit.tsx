import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Audit() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Audit Trail" />
            <div className="flex items-center">
                <History className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Trail</h1>
            </div>
            <p className="text-muted-foreground">Immutable log of all lifecycle events, from procurement to decommissioning.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <History className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Recent Audit Events</p>
                    <p className="text-muted-foreground text-sm mt-2">Any future modifications, lifecycle phase changes, or compliance updates will be logged here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Audit.layout = {
    breadcrumbs: [
        {
            title: 'Audit Trail',
            href: '#',
        },
    ],
};
