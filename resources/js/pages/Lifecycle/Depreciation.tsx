import { Head } from '@inertiajs/react';
import { TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Depreciation() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Depreciation Calculation" />
            <div className="flex items-center">
                <TrendingDown className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Depreciation Calculation</h1>
            </div>
            <p className="text-muted-foreground">Automate straight-line or double-declining balance calculations for asset financial modeling.</p>
            
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <TrendingDown className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">Financial Data Pending</p>
                    <p className="text-muted-foreground text-sm mt-2">Input original purchase costs and salvage values to project depreciation schedules.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Depreciation.layout = {
    breadcrumbs: [
        {
            title: 'Depreciation Calculation',
            href: '#',
        },
    ],
};
