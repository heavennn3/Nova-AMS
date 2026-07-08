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
import { Package, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
            accessorKey: 'name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Spare Part Name" />,
            cell: ({ row }: any) => <span className="font-semibold">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'part_number',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Serial Number" />,
            cell: ({ row }: any) => <span className="font-mono">{row.getValue('part_number')}</span>,
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
        },
        {
            accessorKey: 'location',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Place" />,
        },
        {
            accessorKey: 'site_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
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
            accessorKey: 'used_by_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Used By" />,
            cell: ({ row }: any) => <span>{row.getValue('used_by_name') ?? '—'}</span>,
        },
        {
            accessorKey: 'created_by_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Added By" />,
            cell: ({ row }: any) => <span>{row.getValue('created_by_name') ?? 'N/A'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const part = row.original;
                const nextStatus = part.status === 'available' ? 'faulty' : 'available';
                return (
                    <Button
                        variant="outline" size="sm"
                        onClick={() => {
                            if (confirm(`Set "${part.name}" to ${nextStatus}?`)) {
                                router.put(`/spare-parts/${part.id}`, {
                                    name: part.name,
                                    part_number: part.part_number,
                                    category: part.category,
                                    location: part.location,
                                    status: nextStatus,
                                });
                            }
                        }}
                    >
                        Set {nextStatus.replace('_', ' ')}
                    </Button>
                );
            },
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

                <Button onClick={() => {
                    form.reset();
                    setCreateDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Spare Part
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{totalParts}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-bold">{availableParts}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-red-500/10 p-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Faulty</p>
                        <p className="text-2xl font-bold">{outOfStockParts}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-purple-500/10 p-3">
                        <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Recently Added</p>
                        <p className="text-2xl font-bold">{recentlyAdded}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b py-2 px-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                                <Package className="h-3.5 w-3.5 text-emerald-600" />
                                Inventory by Category
                            </CardTitle>
                            <span className="text-[10px] text-muted-foreground bg-white px-1.5 py-0.5 rounded-full border">
                                {categoryData.length} groups
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1">
                            {categoryData.map((cat: any, i: number) => {
                                const colors = [
                                    { bg: 'bg-emerald-500', dot: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
                                    { bg: 'bg-blue-500', dot: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
                                    { bg: 'bg-purple-500', dot: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
                                    { bg: 'bg-amber-500', dot: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
                                    { bg: 'bg-rose-500', dot: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700' },
                                    { bg: 'bg-cyan-500', dot: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700' },
                                ];
                                const c = colors[i % colors.length];
                                const maxCount = Math.max(...categoryData.map((x: any) => x.count), 1);
                                const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                                return (
                                    <div key={cat.category} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${c.light}`}>
                                            <span className={`text-[10px] font-bold ${c.text}`}>{cat.category[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-medium truncate">{cat.category}</p>
                                                <span className={`text-[10px] font-semibold tabular-nums ${c.text}`}>{cat.count}</span>
                                            </div>
                                            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                                                <div className={`h-full rounded-full transition-all ${c.bg}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockAlerts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No low stock alerts
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockAlerts.map((alert: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div>
                                            <p className="font-medium text-sm">{alert.name}</p>
                                            <p className="text-xs text-muted-foreground">{alert.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-yellow-700">
                                                {alert.stock_level} / {alert.minimum_level}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All Spare Parts Table */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b py-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-600" />
                            All Spare Parts
                        </CardTitle>

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