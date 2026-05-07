import { Head } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Performance() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Performance Tracking" />
            <div className="flex items-center">
                <Briefcase className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Performance Tracking</h1>
            </div>
            <p className="text-muted-foreground">Monitor vendor KPIs, service quality, and contract adherence.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Insufficient Data</p>
                    <p className="text-muted-foreground text-sm mt-2">Log vendor interactions and complete reviews to generate scorecards.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Performance.layout = {
    breadcrumbs: [
        {
            title: 'Performance Tracking',
            href: '#',
        },
    ],
};
