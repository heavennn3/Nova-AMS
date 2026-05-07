import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Technicians() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Technician Assignment" />
            <div className="flex items-center">
                <Users className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Technician Assignment</h1>
            </div>
            <p className="text-muted-foreground">Manage personnel schedules, workload distribution, and skills matrix.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Personnel Assigned</p>
                    <p className="text-muted-foreground text-sm mt-2">Add technicians to the roster to begin assigning tasks.</p>
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
