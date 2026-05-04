import { Head } from '@inertiajs/react';
import { Route, Map as MapIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RouteOptimization() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Route Optimization" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Route className="h-8 w-8 mr-3 text-primary" />
                    Route Optimization
                </h1>
                <p className="text-muted-foreground mt-2">
                    Logistics planning and maintenance routing algorithms.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Fleet Management</CardTitle>
                        <CardDescription>Plan asset transfers and technician deployments.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                            <h3 className="font-medium">No Active Routes</h3>
                            <p className="text-sm text-muted-foreground mt-1">Select a starting point and destination to calculate the optimal path.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 h-[500px] flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-secondary/10 flex flex-col items-start justify-start p-8 border-2 border-dashed border-border/50 m-4 rounded-lg">
                        <MapIcon className="h-16 w-16 text-primary mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold text-foreground">Routing Engine</h2>
                        <p className="text-muted-foreground text-left max-w-md mt-2">
                            Integrate with map services to view calculated trajectories, traffic conditions, and estimated arrival times for mobile assets.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

RouteOptimization.layout = {
    breadcrumbs: [
        {
            title: 'Route Optimization',
            href: '#',
        },
    ],
};
