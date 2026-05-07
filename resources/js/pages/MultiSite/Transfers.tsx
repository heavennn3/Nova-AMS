import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, FileWarning } from 'lucide-react';

export default function Transfers({ sites, transfers }: { sites: any[], transfers: any[] }) {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Transfer Workflows" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <ArrowRightLeft className="h-8 w-8 mr-3 text-primary" />
                    Transfer Workflows
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage asset movements and inter-site transfer approvals.
                </p>
            </div>

            <div className="flex items-start justify-start p-8 h-64 border-2 border-dashed border-border rounded-xl bg-muted/20">
                <div className="text-left">
                    <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No Active Transfers</h3>
                    <p className="text-muted-foreground">There are currently no assets scheduled for transfer between sites.</p>
                </div>
            </div>
        </div>
    );
}

Transfers.layout = {
    breadcrumbs: [
        {
            title: 'Transfer Workflows',
            href: '#',
        },
    ],
};
