import { Head } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Versions() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Version Control" />
            <div className="flex items-center">
                <Layers className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Version Control
                </h1>
            </div>
            <p className="text-muted-foreground">
                Track document revisions, approvals, and previous versions.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Layers className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Revision History</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Documents will appear here once modified.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Versions.layout = {
    breadcrumbs: [
        {
            title: 'Version Control',
            href: '#',
        },
    ],
};
