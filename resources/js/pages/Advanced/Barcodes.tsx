import { Head } from '@inertiajs/react';
import { Barcode } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Barcodes() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Barcode/QR Generation" />
            <div className="flex items-center">
                <Barcode className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Barcode & QR Code Generation</h1>
            </div>
            <p className="text-muted-foreground">Automatically generate scannable tags for physical assets.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Barcode className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Generation Engine Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect a label printer to begin generating physical tags.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Barcodes.layout = {
    breadcrumbs: [
        {
            title: 'Barcode/QR Generation',
            href: '#',
        },
    ],
};
