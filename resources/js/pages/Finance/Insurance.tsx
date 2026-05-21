import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Insurance() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Insurance" />
            <div className="flex items-center">
                <Shield className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Asset Insurance Policies
                </h1>
            </div>
            <p className="text-muted-foreground">
                Track policy numbers, premiums, and coverage limits.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Shield className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        No Policies Registered
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add insurance provider details to link policies to
                        high-value assets.
                    </p>
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
