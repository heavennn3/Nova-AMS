import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, CheckCircle, Plus, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function SparePartsDashboard({
    totalParts = 0,
    availableParts = 0,
    outOfStockParts = 0,
    recentlyAdded = 0,
    categoryData = [],
    lowStockAlerts = [],
    allParts = [],
    sites = [],
}: {
    totalParts: number;
    availableParts: number;
    outOfStockParts: number;
    recentlyAdded: number;
    categoryData: any[];
    lowStockAlerts: any[];
    allParts: any[];
    sites?: any[];
}) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [importSiteId, setImportSiteId] = useState('all');

    const confirmImport = (importedData: any[]) => {
        if (!importedData || importedData.length === 0) {
            toast.error('CSV file is empty.');
            return;
        }
        router.post('/spare-parts/import-bulk',
            { spare_parts: importedData, site_id: importSiteId === 'all' ? null : importSiteId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Imported ${importedData.length} spare parts!`);
                    router.reload({ only: ['allParts', 'totalParts', 'categoryData'] });
                },
                onError: (err: any) => {
                    console.error(err);
                    toast.error(typeof err === 'string' ? err : 'Import failed.');
                },
            },
        );
    };

    const openFilePicker = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => confirmImport(results.data),
            });
        };
        input.click();
    };

    const downloadCsvTemplate = () => {
        const headers = ['name', 'part_number', 'category', 'site_id', 'location', 'status', 'used_by', 'created_by'];
        const csvContent = [
            headers.join(','),
            'DDR4 16GB RAM,SP-50001,RAM,7,Rack A - Shelf 3,available,,'
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spare_parts_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const form = useForm({
        name: '',
        part_number: '',
        category: '',
        location: '',
        site_id: 'all',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: form.data.name,
            part_number: form.data.part_number,
            category: form.data.category,
            location: form.data.location,
            site_id: form.data.site_id === 'all' ? null : form.data.site_id,
        };
        router.post('/spare-parts', data, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                form.reset();
                toast.success('Spare part added successfully');
            },
            onError: () => {
                toast.error('Failed to add spare part');
            }
        });
    };

    const sparePartColumns = [
        {
            accessorKey: 'id',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
        },
        {
            accessorKey: 'name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }: any) => (
                <Link href={`/spare-parts/${row.original.id}`} className="font-semibold text-primary hover:underline transition-colors">
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'part_number',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Part Number" />,
            cell: ({ row }: any) => <span className="font-mono">{row.getValue('part_number')}</span>,
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
        },
        {
            accessorKey: 'site_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
        },
        {
            accessorKey: 'location',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Location" />,
        },
        {
            accessorKey: 'status',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }: any) => {
                const status = row.getValue('status') as string;
                const colors: Record<string, string> = {
                    available: 'bg-green-100 text-green-700',
                    in_used: 'bg-blue-100 text-blue-700',
                    faulty: 'bg-red-100 text-red-700',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status?.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <Link href={`/spare-parts/${row.original.id}`} className="text-sm text-primary hover:underline">
                    View
                </Link>
            ),
        },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Spare Parts Dashboard" />

            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Spare Parts Inventory
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
                        <Download className="mr-2 h-4 w-4" /> CSV Template
                    </Button>
                    <div className="flex items-center gap-2">
                        {sites.length > 0 && (
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger className="h-9 w-[160px] text-sm">
                                    <SelectValue placeholder="Select site" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sites</SelectItem>
                                    {sites.map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button variant="outline" size="sm" onClick={openFilePicker}>
                            <Upload className="mr-2 h-4 w-4" /> Import CSV
                        </Button>
                    </div>
                    <Button onClick={() => {
                        form.reset();
                        setCreateDialogOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Spare Part
                    </Button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Items', value: totalParts, icon: Package, bg: 'bg-blue-500/10', text: 'text-blue-600' },
                    { label: 'Available', value: availableParts, icon: CheckCircle, bg: 'bg-green-500/10', text: 'text-green-600' },
                    { label: 'Faulty', value: outOfStockParts, icon: AlertTriangle, bg: 'bg-red-500/10', text: 'text-red-600' },
                    { label: 'Recently Added', value: recentlyAdded, icon: Package, bg: 'bg-purple-500/10', text: 'text-purple-600' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm min-h-[90px]">
                        <div className={`rounded-full ${s.bg} p-3 shrink-0`}>
                            <s.icon className={`h-6 w-6 ${s.text}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-muted-foreground truncate">{s.label}</p>
                            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Category Breakdown + Low Stock ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b py-3 px-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <Package className="h-4 w-4 text-emerald-600" />
                                Inventory by Category
                            </CardTitle>
                            <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full border">
                                {categoryData.length} categories
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {categoryData.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No category data</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {categoryData.map((cat: any, i: number) => {
                                    const colors = [
                                        { bar: 'bg-emerald-500', light: 'bg-emerald-50', label: 'text-emerald-700' },
                                        { bar: 'bg-blue-500', light: 'bg-blue-50', label: 'text-blue-700' },
                                        { bar: 'bg-purple-500', light: 'bg-purple-50', label: 'text-purple-700' },
                                        { bar: 'bg-amber-500', light: 'bg-amber-50', label: 'text-amber-700' },
                                        { bar: 'bg-rose-500', light: 'bg-rose-50', label: 'text-rose-700' },
                                        { bar: 'bg-cyan-500', light: 'bg-cyan-50', label: 'text-cyan-700' },
                                    ];
                                    const c = colors[i % colors.length];
                                    const maxCount = Math.max(...categoryData.map((x: any) => x.count), 1);
                                    const pct = (cat.count / maxCount) * 100;
                                    return (
                                        <div key={cat.category} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.light}`}>
                                                <span className={`text-xs font-bold ${c.label}`}>{cat.category[0]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-sm font-medium truncate">{cat.category}</p>
                                                    <span className={`text-xs font-semibold tabular-nums ${c.label}`}>{cat.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b py-3 px-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {lowStockAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <CheckCircle className="h-10 w-10 text-green-400 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">All items in good stock</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">No low stock alerts at this time</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lowStockAlerts.map((alert: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{alert.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{alert.location}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-sm font-semibold text-amber-700 tabular-nums">
                                                {alert.stock_level ?? '?'} / {alert.minimum_level ?? '?'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── All Spare Parts Table ── */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-3 px-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-600" />
                            All Spare Parts
                        </CardTitle>
                        <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-full border">
                            {allParts.length} items
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={sparePartColumns}
                        data={allParts}
                    />
                </CardContent>
            </Card>

            {/* Create Spare Part Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add New Spare Part</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Spare Part Name *</Label>
                                <Input
                                    required
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., DDR4 16GB RAM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Serial Number *</Label>
                                <Input
                                    required
                                    value={form.data.part_number}
                                    onChange={(e) => form.setData('part_number', e.target.value)}
                                    placeholder="e.g., SN-2024-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={form.data.category}
                                    onValueChange={(v) => form.setData('category', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['RAM', 'MONITOR', 'STORAGE', 'CABLE', 'PSU', 'RJ45', 'CABLE TRACER'].map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Site</Label>
                                <Select
                                    value={form.data.site_id}
                                    onValueChange={(v) => form.setData('site_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global (All Sites)</SelectItem>
                                        {sites.map((site: any) => (
                                            <SelectItem key={site.id} value={String(site.id)}>
                                                {site.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Place (Where Kept) *</Label>
                                <Input
                                    required
                                    value={form.data.location}
                                    onChange={(e) => form.setData('location', e.target.value)}
                                    placeholder="e.g., Rack A - Shelf 3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save Part'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

SparePartsDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Spare Parts',
            href: '/spare-parts',
        },
        {
            title: 'Dashboard',
            href: '#',
        },
    ],
};