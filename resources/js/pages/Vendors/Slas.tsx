import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Slas() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Service Level Agreements" />
            <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Service Level Agreements (SLAs)</h1>
            </div>
            <p className="text-muted-foreground">Track resolution times, uptime guarantees, and vendor compliance metrics.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Active SLAs Tracked</p>
                    <p className="text-muted-foreground text-sm mt-2">Configure SLA parameters for your active vendor contracts to begin monitoring.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Slas.layout = {
    breadcrumbs: [
        {
            title: 'Service Level Agreements',
            href: '#',
        },
    ],
};
