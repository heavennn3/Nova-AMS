import { Head } from '@inertiajs/react';
import { Layers, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

export default function FloorPlans({ sites = [] }: { sites: any[] }) {
    const [selectedSite, setSelectedSite] = useState<string>(sites.length > 0 ? sites[0].id.toString() : '');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Site Floor Plans" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <Layers className="h-8 w-8 mr-3 text-primary" />
                        Site Floor Plans
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        View 2D/3D facility floor plans to precisely locate indoor assets.
                    </p>
                </div>
                
                <div className="w-full md:w-64">
                    <Select value={selectedSite} onValueChange={setSelectedSite}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Facility" />
                        </SelectTrigger>
                        <SelectContent>
                            {sites.map(site => (
                                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="w-full h-[600px] border-border shadow-sm flex flex-col relative overflow-hidden">
                <CardHeader className="border-b bg-muted/10">
                    <CardTitle>Indoor Blueprint Viewer</CardTitle>
                    <CardDescription>Select a site from the dropdown to load the corresponding architectural layout.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-start justify-start p-8 bg-secondary/20 relative">
                    <ImageIcon className="h-20 w-20 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-foreground">Blueprint Rendering Engine Offline</p>
                    <p className="text-sm text-muted-foreground max-w-md text-left mt-2">
                        Upload an architectural CAD file or image layout to map your assets onto the floor plan coordinate system.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

FloorPlans.layout = {
    breadcrumbs: [
        {
            title: 'Site Floor Plans',
            href: '#',
        },
    ],
};
