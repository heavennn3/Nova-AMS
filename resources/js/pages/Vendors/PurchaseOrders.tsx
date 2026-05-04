import { Head } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function PurchaseOrders() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Purchase Orders" />
            <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Purchase Orders</h1>
            </div>
            <p className="text-muted-foreground">Manage procurement lifecycles, track approvals, and link POs to assets.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Recent Orders</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect your financial or ERP software to view active purchase orders.</p>
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
