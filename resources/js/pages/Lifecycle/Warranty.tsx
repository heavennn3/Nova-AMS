import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Warranty() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Warranty Management" />
            <div className="flex items-center">
                <ShieldAlert className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Warranty Management</h1>
            </div>
            <p className="text-muted-foreground">Track coverage periods, vendor liabilities, and automate RMA requests.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ShieldAlert className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Active Warranties Linked</p>
                    <p className="text-muted-foreground text-sm mt-2">Upload warranty certificates to begin tracking expiration and compliance.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Warranty.layout = {
    breadcrumbs: [
        {
            title: 'Warranty Management',
            href: '#',
        },
    ],
};
