import { Head } from '@inertiajs/react';
import { FileSignature } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Contracts() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Contract Documents" />
            <div className="flex items-center">
                <FileSignature className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Contract Documents</h1>
            </div>
            <p className="text-muted-foreground">Securely store SLAs, lease agreements, and vendor contracts.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <FileSignature className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Secure Vault Locked</p>
                    <p className="text-muted-foreground text-sm mt-2">Requires elevated permissions to view master contracts.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Contracts.layout = {
    breadcrumbs: [
        {
            title: 'Contract Documents',
            href: '#',
        },
    ],
};
