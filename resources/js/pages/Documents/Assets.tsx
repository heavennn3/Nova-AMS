import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Assets() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Documentation" />
            <div className="flex items-center">
                <FileText className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Documentation</h1>
            </div>
            <p className="text-muted-foreground">Store and retrieve manuals, blueprints, and operating procedures.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Document Vault Empty</p>
                    <p className="text-muted-foreground text-sm mt-2">Upload PDF or DOCX files and tag them to specific assets.</p>
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
