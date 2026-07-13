import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    MapPin,
    Tag,
    Layers,
    Building2,
    User,
    Clock,
    Calendar,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700 border-green-200',
    in_used: 'bg-blue-100 text-blue-700 border-blue-200',
    faulty: 'bg-red-100 text-red-700 border-red-200',
};

export default function Show({ part, sites = [] }: { part: any; sites?: any[] }) {
    const details = [
        { icon: Tag, label: 'Part Number', value: part.part_number },
        { icon: Layers, label: 'Category', value: part.category },
        { icon: MapPin, label: 'Location', value: part.location },
        { icon: Building2, label: 'Site', value: part.site_name },
        { icon: User, label: 'Used By', value: part.used_by_name },
        { icon: User, label: 'Created By', value: part.created_by_name },
        { icon: Calendar, label: 'Created At', value: part.created_at ? new Date(part.created_at).toLocaleDateString() : '—' },
        { icon: Clock, label: 'Updated At', value: part.updated_at ? new Date(part.updated_at).toLocaleDateString() : '—' },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title={`${part.name} - Spare Part`} />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/spare-parts/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Package className="h-6 w-6 text-primary" />
                            {part.name}
                        </h1>
                    </div>
                    <Badge className={`text-xs px-3 py-1 ${statusColors[part.status] || 'bg-gray-100 text-gray-700'}`}>
                        {part.status?.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.get(`/spare-parts/dashboard`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Details */}
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b py-3 px-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Spare Part Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <dl className="divide-y">
                            {details.map(d => (
                                <div key={d.label} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground min-w-[140px]">
                                        <d.icon className="h-4 w-4 shrink-0" />
                                        {d.label}
                                    </dt>
                                    <dd className="text-sm font-medium truncate">{d.value || '—'}</dd>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>

                {/* Status Actions */}
                <Card>
                    <CardHeader className="border-b py-3 px-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            Status Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {['available', 'in_used', 'faulty'].map(s => (
                            <Button
                                key={s}
                                variant={part.status === s ? 'default' : 'outline'}
                                size="sm"
                                className="w-full justify-start"
                                disabled={part.status === s}
                                onClick={() => {
                                    if (confirm(`Set "${part.name}" status to ${s.replace('_', ' ')}?`)) {
                                        router.put(`/spare-parts/${part.id}`, {
                                            name: part.name,
                                            part_number: part.part_number,
                                            category: part.category,
                                            location: part.location,
                                            site_id: part.site_id,
                                            status: s,
                                        }, {
                                            preserveScroll: true,
                                            onSuccess: () => router.reload(),
                                        });
                                    }
                                }}
                            >
                                {s === 'available' && <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />}
                                {s === 'in_used' && <Package className="mr-2 h-4 w-4 text-blue-600" />}
                                {s === 'faulty' && <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />}
                                Set {s.replace('_', ' ')}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Custom EAV Fields */}
            {part.fields && Object.keys(part.fields).length > 0 && (
                <Card>
                    <CardHeader className="border-b py-3 px-4">
                        <CardTitle className="text-sm font-semibold">Additional Fields</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <dl className="divide-y">
                            {Object.entries(part.fields).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                                    <dt className="text-sm text-muted-foreground min-w-[140px] capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </dt>
                                    <dd className="text-sm font-medium">{String(value) || '—'}</dd>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Spare Parts', href: '/spare-parts' },
        { title: 'Dashboard', href: '/spare-parts/dashboard' },
    ],
};
