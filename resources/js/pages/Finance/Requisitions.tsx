import { Head } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Requisitions() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Purchase Requisitions" />
            <div className="flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Purchase Requisitions
                </h1>
            </div>
            <p className="text-muted-foreground">
                Manage approvals for new asset procurements.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Pending Requests</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        All purchasing requests have been approved or rejected.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Requisitions.layout = {
    breadcrumbs: [
        {
            title: 'Purchase Requisitions',
            href: '#',
        },
    ],
};
