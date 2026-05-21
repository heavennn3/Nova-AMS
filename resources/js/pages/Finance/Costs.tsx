import { Head } from '@inertiajs/react';
import { Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Costs() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Cost Center Allocation" />
            <div className="flex items-center">
                <Building className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Cost Center Allocation
                </h1>
            </div>
            <p className="text-muted-foreground">
                Distribute asset costs across different organizational
                departments.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Building className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Cost Centers Unassigned
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Map assets to specific cost centers in the master data
                        configuration.
                    </p>
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
