import { Head } from '@inertiajs/react';
import { FileSignature } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Contracts() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Contract Documents" />
            <div className="flex items-center">
                <FileSignature className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Contract Documents
                </h1>
            </div>
            <p className="text-muted-foreground">
                Securely store SLAs, lease agreements, and vendor contracts.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <FileSignature className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Secure Vault Locked</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Requires elevated permissions to view master contracts.
                    </p>
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
