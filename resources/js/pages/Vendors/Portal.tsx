import { Head } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Portal() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Vendor Portal Integration" />
            <div className="flex items-center">
                <Globe className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Vendor Portal</h1>
            </div>
            <p className="text-muted-foreground">External gateway for vendors to submit invoices, update statuses, and communicate.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Portal Settings Restricted</p>
                    <p className="text-muted-foreground text-sm mt-2">Vendor external access is currently disabled by system administration.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Portal.layout = {
    breadcrumbs: [
        {
            title: 'Vendor Portal Integration',
            href: '#',
        },
    ],
};
