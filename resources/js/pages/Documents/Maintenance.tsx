import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Maintenance() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Maintenance Records" />
            <div className="flex items-center">
                <ClipboardList className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Records</h1>
            </div>
            <p className="text-muted-foreground">Archive service reports, inspection certificates, and technician sign-offs.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ClipboardList className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Records Found</p>
                    <p className="text-muted-foreground text-sm mt-2">Closed work orders will automatically generate records here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Maintenance.layout = {
    breadcrumbs: [
        {
            title: 'Maintenance Records',
            href: '#',
        },
    ],
};
