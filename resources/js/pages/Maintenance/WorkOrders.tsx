import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function WorkOrders() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Work Orders" />
            <div className="flex items-center">
                <FileText className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Active Work Orders</h1>
            </div>
            <p className="text-muted-foreground">Track open repair tickets, prioritize tasks, and assign personnel.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Active Work Orders</p>
                    <p className="text-muted-foreground text-sm mt-2">All tasks are currently completed or pending approval.</p>
                </CardContent>
            </Card>
        </div>
    );
}

WorkOrders.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: '#',
        },
    ],
};
