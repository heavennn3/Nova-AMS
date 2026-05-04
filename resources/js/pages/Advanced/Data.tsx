import { Head } from '@inertiajs/react';
import { DatabaseBackup } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Data() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Data Import/Export" />
            <div className="flex items-center">
                <DatabaseBackup className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Import/Export</h1>
            </div>
            <p className="text-muted-foreground">Bulk operations and full database backups.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <DatabaseBackup className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Backup Ready</p>
                    <p className="text-muted-foreground text-sm mt-2">You can initiate a full SQL dump or CSV export.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Data.layout = {
    breadcrumbs: [
        {
            title: 'Data Import/Export',
            href: '#',
        },
    ],
};
