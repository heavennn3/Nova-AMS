import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    MapPin,
    Tag,
    Layers,
    Building2,
    User,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
    available: { bg: 'bg-green-100 text-green-700 border-green-200', text: 'text-green-600', icon: CheckCircle2 },
    in_used: { bg: 'bg-blue-100 text-blue-700 border-blue-200', text: 'text-blue-600', icon: Package },
    faulty: { bg: 'bg-red-100 text-red-700 border-red-200', text: 'text-red-600', icon: AlertTriangle },
};

export default function Show({ part, sites = [] }: { part: any; sites?: any[] }) {
    const cfg = statusConfig[part.status] || statusConfig.available;
    const StatusIcon = cfg.icon;

    const summaryFields = [
        { label: 'Part Number', value: part.part_number, icon: Tag },
        { label: 'Category', value: part.category, icon: Layers },
        { label: 'Location', value: part.location, icon: MapPin },
        { label: 'Site', value: part.site_name, icon: Building2 },
    ];

    const infoFields = [
        { label: 'Used By', value: part.used_by_name, icon: User },
        { label: 'Created By', value: part.created_by_name, icon: User },
        { label: 'Created At', value: part.created_at ? new Date(part.created_at).toLocaleDateString() : '—', icon: Calendar },
        { label: 'Updated At', value: part.updated_at ? new Date(part.updated_at).toLocaleDateString() : '—', icon: Clock },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title={`${part.name} - Spare Part`} />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4 min-w-0">
                    <Link href="/spare-parts/dashboard" className="text-muted-foreground hover:text-foreground shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-full bg-primary/10 p-2 shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold tracking-tight truncate">{part.name}</h1>
                        </div>
                    </div>
                    <Badge className={`text-xs px-3 py-1 ${cfg.bg}`}>
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {part.status?.replace('_', ' ')}
                    </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.get('/spare-parts/dashboard')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {summaryFields.map(f => (
                    <Card key={f.label} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted p-2 shrink-0">
                                    <f.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">{f.label}</p>
                                    <p className="text-sm font-semibold truncate mt-0.5">{f.value || '—'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Details + Status Actions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Info Fields */}
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b py-3 px-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Spare Part Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <dl className="divide-y">
                            {infoFields.map(f => (
                                <div key={f.label} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                                    <dt className="flex items-center gap-2 text-sm text-muted-foreground min-w-[130px]">
                                        <f.icon className="h-4 w-4 shrink-0" />
                                        {f.label}
                                    </dt>
                                    <dd className="text-sm font-medium truncate">{f.value || '—'}</dd>
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
                        {['available', 'in_used', 'faulty'].map(s => {
                            const Icon = s === 'available' ? CheckCircle2 : s === 'in_used' ? Package : AlertTriangle;
                            const color = s === 'available' ? 'text-green-600' : s === 'in_used' ? 'text-blue-600' : 'text-red-600';

                            return (
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
                                    <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                    Set {s.replace('_', ' ')}
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Custom EAV Fields */}
            {part.fields && Object.keys(part.fields).length > 0 && (
                <Card>
                    <CardHeader className="border-b py-3 px-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Additional Fields
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <dl className="divide-y">
                            {Object.entries(part.fields).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                                    <dt className="text-sm text-muted-foreground min-w-[140px] capitalize flex items-center gap-2">
                                        <FileText className="h-4 w-4 shrink-0" />
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
