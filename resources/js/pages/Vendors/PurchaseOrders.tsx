import { Head } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PurchaseOrders() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Purchase Orders" />
            <div className="flex items-center">
                <ShoppingCart className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Purchase Orders
                </h1>
            </div>
            <p className="text-muted-foreground">
                Manage procurement lifecycles, track approvals, and link POs to
                assets.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Recent Orders</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect your financial or ERP software to view active
                        purchase orders.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

PurchaseOrders.layout = {
    breadcrumbs: [
        {
            title: 'Purchase Orders',
            href: '#',
        },
    ],
};
