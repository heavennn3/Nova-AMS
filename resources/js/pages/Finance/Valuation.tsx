import { Head } from '@inertiajs/react';
import { CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Valuation() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Valuation" />
            <div className="flex items-center">
                <CircleDollarSign className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Asset Valuation
                </h1>
            </div>
            <p className="text-muted-foreground">
                Calculate current market values and net book values.
            </p>
            <Card className="flex h-[400px] items-start justify-start border-dashed bg-muted/10 p-8">
                <CardContent className="text-left">
                    <CircleDollarSign className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <p className="text-lg font-medium">
                        Valuation Engine Offline
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Input base costs and depreciation matrices to calculate
                        ongoing valuations.
                    </p>
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
