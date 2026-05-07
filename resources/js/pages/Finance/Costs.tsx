import { Head } from '@inertiajs/react';
import { Building } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Costs() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Cost Center Allocation" />
            <div className="flex items-center">
                <Building className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Cost Center Allocation</h1>
            </div>
            <p className="text-muted-foreground">Distribute asset costs across different organizational departments.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Building className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Cost Centers Unassigned</p>
                    <p className="text-muted-foreground text-sm mt-2">Map assets to specific cost centers in the master data configuration.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Costs.layout = {
    breadcrumbs: [
        {
            title: 'Cost Center Allocation',
            href: '#',
        },
    ],
};
