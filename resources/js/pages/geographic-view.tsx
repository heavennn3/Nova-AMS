import { Head } from '@inertiajs/react';
import { MapPin, Globe, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeographicView({ sites = [] }: { sites: any[] }) {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Geographic View" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Globe className="h-8 w-8 mr-3 text-primary" />
                    Geographic View
                </h1>
                <p className="text-muted-foreground mt-2">
                    Interactive map overview of all regional operational sites.
                </p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[500px] relative">
                {/* Placeholder for Interactive Map Integration (e.g. Mapbox, Leaflet, Google Maps) */}
                <div className="absolute inset-0 bg-muted/20 flex flex-col items-start justify-start p-8 border-2 border-dashed border-border/50 m-4 rounded-lg">
                    <MapPin className="h-16 w-16 text-primary mb-4 animate-bounce" />
                    <h2 className="text-xl font-semibold text-foreground">Interactive Map Module</h2>
                    <p className="text-muted-foreground text-left max-w-md mt-2">
                        Geospatial mapping engine will render here. It will display the operational distribution of {sites.length} recorded sites.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map(site => (
                    <Card key={site.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center">
                                {site.name}
                                <Activity className="h-4 w-4 text-green-500" />
                            </CardTitle>
                            <CardDescription>{site.region} • {site.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Registered Assets: </span>
                                <span className="font-semibold text-foreground">{site.assets_count || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

GeographicView.layout = {
    breadcrumbs: [
        {
            title: 'Geographic View',
            href: '#',
        },
    ],
};
