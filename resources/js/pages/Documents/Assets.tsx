import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Assets() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Documentation" />
            <div className="flex items-center">
                <FileText className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Asset Documentation
                </h1>
            </div>
            <p className="text-muted-foreground">
                Store and retrieve manuals, blueprints, and operating
                procedures.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Document Vault Empty</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Upload PDF or DOCX files and tag them to specific
                        assets.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

Assets.layout = {
    breadcrumbs: [
        {
            title: 'Asset Documentation',
            href: '#',
        },
    ],
};
