import { Head } from '@inertiajs/react';
import { Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Heatmaps() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Geographic Heat Maps" />
            <div className="flex items-center">
                <Map className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Geographic Heat Maps
                </h1>
            </div>
            <p className="text-muted-foreground">
                Visualize asset density and incident rates across multiple
                locations.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Map className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Heatmap Rendering Engine Offline
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect your mapping provider to visualize geospatial
                        asset data.
                    </p>
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
