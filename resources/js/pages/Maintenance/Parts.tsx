import { Head } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Parts() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Spare Parts Inventory" />
            <div className="flex items-center">
                <Package className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Spare Parts Inventory</h1>
            </div>
            <p className="text-muted-foreground">Monitor stock levels, reorder thresholds, and part allocations.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Inventory Data Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect to your warehouse ERP to sync spare part counts.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Parts.layout = {
    breadcrumbs: [
        {
            title: 'Spare Parts Inventory',
            href: '#',
        },
    ],
};
