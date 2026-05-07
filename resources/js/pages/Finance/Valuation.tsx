import { Head } from '@inertiajs/react';
import { CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Valuation() {
    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Asset Valuation" />
            <div className="flex items-center">
                <CircleDollarSign className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Valuation</h1>
            </div>
            <p className="text-muted-foreground">Calculate current market values and net book values.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <CircleDollarSign className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Valuation Engine Offline</p>
                    <p className="text-muted-foreground text-sm mt-2">Input base costs and depreciation matrices to calculate ongoing valuations.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Valuation.layout = {
    breadcrumbs: [
        {
            title: 'Asset Valuation',
            href: '#',
        },
    ],
};
