import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, MapPin, Package, RefreshCw } from 'lucide-react';

export default function Dashboards({ sites }: { sites: any[] }) {
    const totalSites = sites.length;
    const totalAssets = sites.reduce((acc, site) => acc + (site.assets_count || 0), 0);

    return (
        <div className="p-8 w-full space-y-8">
            <Head title="Multi-Site Dashboards" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Multi-Site Dashboards</h1>
                <p className="text-muted-foreground mt-2">
                    High-level overview of asset distribution across all operational locations.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Operational Sites</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSites}</div>
                        <p className="text-xs text-muted-foreground">Active and monitored</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tracked Assets</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAssets}</div>
                        <p className="text-xs text-muted-foreground">Across all sites</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Assets currently in transit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Optimal</div>
                        <p className="text-xs text-muted-foreground">All connections stable</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sites.map(site => (
                    <Card key={site.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{site.name}</CardTitle>
                            <CardDescription>{site.region || 'Unknown Region'} • {site.code || 'NO-CODE'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Registered Assets</p>
                                    <p className="text-3xl font-semibold text-primary">{site.assets_count || 0}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 flex items-start justify-start p-8">
                                    <span className="text-sm font-medium">{Math.round(((site.assets_count || 0) / (totalAssets || 1)) * 100)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

Dashboards.layout = {
    breadcrumbs: [
        {
            title: 'Multi-Site Dashboards',
            href: '#',
        },
    ],
};
