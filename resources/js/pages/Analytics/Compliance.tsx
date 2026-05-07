import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Compliance() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Compliance Reports" />
            <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance Reports</h1>
            </div>
            <p className="text-muted-foreground">Generate regulatory and safety compliance documents.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">100% Compliant</p>
                    <p className="text-muted-foreground text-sm mt-2">No pending regulatory infractions or missing safety logs.</p>
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
