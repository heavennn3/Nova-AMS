import { Head } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Versions() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Version Control" />
            <div className="flex items-center">
                <Layers className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Version Control</h1>
            </div>
            <p className="text-muted-foreground">Track document revisions, approvals, and previous versions.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Layers className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Revision History</p>
                    <p className="text-muted-foreground text-sm mt-2">Documents will appear here once modified.</p>
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
