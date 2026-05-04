import { Head } from '@inertiajs/react';
import { Map } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Heatmaps() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Geographic Heat Maps" />
            <div className="flex items-center">
                <Map className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Geographic Heat Maps</h1>
            </div>
            <p className="text-muted-foreground">Visualize asset density and incident rates across multiple locations.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Heatmap Rendering Engine Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect your mapping provider to visualize geospatial asset data.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Heatmaps.layout = {
    breadcrumbs: [
        {
            title: 'Geographic Heat Maps',
            href: '#',
        },
    ],
};
