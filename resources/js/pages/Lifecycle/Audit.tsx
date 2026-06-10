import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Audit() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Audit Trail" />
            <div className="flex items-center">
                <History className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Audit Trail
                </h1>
            </div>
           

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <History className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        No Recent Audit Events
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Any future modifications, lifecycle phase changes, or
                        compliance updates will be logged here.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Audit.layout = {
    breadcrumbs: [
        {
            title: 'Audit Trail',
            href: '#',
        },
    ],
};
