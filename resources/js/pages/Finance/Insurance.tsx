import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Insurance() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Asset Insurance" />
            <div className="flex items-center">
                <Shield className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Insurance Policies</h1>
            </div>
            <p className="text-muted-foreground">Track policy numbers, premiums, and coverage limits.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Policies Registered</p>
                    <p className="text-muted-foreground text-sm mt-2">Add insurance provider details to link policies to high-value assets.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Insurance.layout = {
    breadcrumbs: [
        {
            title: 'Asset Insurance',
            href: '#',
        },
    ],
};
