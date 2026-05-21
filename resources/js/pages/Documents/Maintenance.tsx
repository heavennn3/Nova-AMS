import { Head } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Maintenance() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Maintenance Records" />
            <div className="flex items-center">
                <ClipboardList className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Maintenance Records
                </h1>
            </div>
            <p className="text-muted-foreground">
                Archive service reports, inspection certificates, and technician
                sign-offs.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Records Found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Closed work orders will automatically generate records
                        here.
                    </p>
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
