import { Head } from '@inertiajs/react';
import { Smartphone } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Mobile() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Mobile App Settings" />
            <div className="flex items-center">
                <Smartphone className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Mobile App Configuration</h1>
            </div>
            <p className="text-muted-foreground">Manage field worker mobile app permissions and layout.</p>
            <Card className="h-[400px] flex items-start justify-start p-8 bg-muted/10 border-dashed">
                <CardContent className="text-left">
                    <Smartphone className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium">No Devices Connected</p>
                    <p className="text-muted-foreground text-sm mt-2">Download the Nova-AMS Field Worker app to pair devices.</p>
                </CardContent>
            </Card>
        </div>
    );
}

Mobile.layout = {
    breadcrumbs: [
        {
            title: 'Mobile App Settings',
            href: '#',
        },
    ],
};
