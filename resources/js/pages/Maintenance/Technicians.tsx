import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Technicians() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Technician Assignment" />
            <div className="flex items-center">
                <Users className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Technician Assignment
                </h1>
            </div>
         

            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <Users className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">No Personnel Assigned</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Add technicians to the roster to begin assigning tasks.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Technicians.layout = {
    breadcrumbs: [
        {
            title: 'Technician Assignment',
            href: '#',
        },
    ],
};
