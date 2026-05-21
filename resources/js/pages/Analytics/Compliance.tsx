import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Compliance() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Compliance Reports" />
            <div className="flex items-center">
                <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Compliance Reports
                </h1>
            </div>
            <p className="text-muted-foreground">
                Generate regulatory and safety compliance documents.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <ShieldCheck className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">100% Compliant</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        No pending regulatory infractions or missing safety
                        logs.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Compliance.layout = {
    breadcrumbs: [
        {
            title: 'Compliance Reports',
            href: '#',
        },
    ],
};
