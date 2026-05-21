import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Warranty() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Warranty Management" />
            <div className="flex items-center">
                <ShieldAlert className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Warranty Management
                </h1>
            </div>
            <p className="text-muted-foreground">
                Track coverage periods, vendor liabilities, and automate RMA
                requests.
            </p>

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ShieldAlert className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        No Active Warranties Linked
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Upload warranty certificates to begin tracking
                        expiration and compliance.
                    </p>
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
