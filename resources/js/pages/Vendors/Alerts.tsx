import { Head } from '@inertiajs/react';
import { FileWarning } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Alerts() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Expiration Alerts" />
            <div className="flex items-center">
                <FileWarning className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Expiration Alerts</h1>
            </div>
            <p className="text-muted-foreground">Stay ahead of contract renewals, expiring warranties, and license deadlines.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <FileWarning className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Pending Alerts</p>
                    <p className="text-muted-foreground text-sm mt-2">All vendor contracts and warranties are currently active and far from expiration.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Alerts.layout = {
    breadcrumbs: [
        {
            title: 'Expiration Alerts',
            href: '#',
        },
    ],
};
