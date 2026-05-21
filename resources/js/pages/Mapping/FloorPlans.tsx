import { Head } from '@inertiajs/react';
import { Layers, Image as ImageIcon } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function FloorPlans({ sites = [] }: { sites: any[] }) {
    const [selectedSite, setSelectedSite] = useState<string>(
        sites.length > 0 ? sites[0].id.toString() : '',
    );

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Site Floor Plans" />

            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Layers className="mr-3 h-8 w-8 text-primary" />
                        Site Floor Plans
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        View 2D/3D facility floor plans to precisely locate
                        indoor assets.
                    </p>
                </div>

                <div className="w-full md:w-64">
                    <Select
                        value={selectedSite}
                        onValueChange={setSelectedSite}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Facility" />
                        </SelectTrigger>
                        <SelectContent>
                            {sites.map((site) => (
                                <SelectItem
                                    key={site.id}
                                    value={site.id.toString()}
                                >
                                    {site.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="relative flex h-[600px] w-full flex-col overflow-hidden border-border shadow-sm">
                <CardHeader className="border-b bg-muted/10">
                    <CardTitle>Indoor Blueprint Viewer</CardTitle>
                    <CardDescription>
                        Select a site from the dropdown to load the
                        corresponding architectural layout.
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative flex flex-1 flex-col items-start justify-start bg-secondary/20 p-8">
                    <ImageIcon className="mb-4 h-20 w-20 text-muted-foreground/30" />
                    <p className="text-lg font-medium text-foreground">
                        Blueprint Rendering Engine Offline
                    </p>
                    <p className="mt-2 max-w-md text-left text-sm text-muted-foreground">
                        Upload an architectural CAD file or image layout to map
                        your assets onto the floor plan coordinate system.
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
