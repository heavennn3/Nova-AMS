import { Head, Link, router, useForm } from '@inertiajs/react';
import { Package, AlertTriangle, CheckCircle, Plus, Upload, Download, Search } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    const [filterSite, setFilterSite] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [categoryPage, setCategoryPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

            if (!file) {
                return;
            }

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

    // ── Filtering ──
    const categories = [...new Set(allParts.map((p: any) => p.category).filter(Boolean))] as string[];

    const filteredParts = allParts.filter((p: any) => {
        if (filterSite !== 'all' && String(p.site_id) !== filterSite) {
            return false;
        }

        if (filterCategory !== 'all' && p.category !== filterCategory) {
            return false;
        }

        if (filterStatus !== 'all' && p.status !== filterStatus) {
            return false;
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            const match = (val: any) => String(val ?? '').toLowerCase().includes(q);

            if (!match(p.name) && !match(p.part_number) && !match(p.category) && !match(p.location)) {
                return false;
            }
        }

        return true;
    });

    const categoryPageSize = 6;
    const categoryPageCount = Math.max(Math.ceil(categoryData.length / categoryPageSize), 1);
    const pagedCategories = categoryData.slice(
        (categoryPage - 1) * categoryPageSize,
        categoryPage * categoryPageSize,
    );
    const selectedCategoryParts = selectedCategory
        ? allParts.filter((part: any) => part.category === selectedCategory)
        : [];

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

                    <div className="flex items-center gap-2">

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
                            <div className="space-y-2">
                                {pagedCategories.map((cat: any, i: number) => {
                                    const colors = [
                                        { bar: 'bg-emerald-500', light: 'bg-emerald-50', label: 'text-emerald-700' },
                                        { bar: 'bg-blue-500', light: 'bg-blue-50', label: 'text-blue-700' },
                                        { bar: 'bg-purple-500', light: 'bg-purple-50', label: 'text-purple-700' },
                                        { bar: 'bg-amber-500', light: 'bg-amber-50', label: 'text-amber-700' },
                                        { bar: 'bg-rose-500', light: 'bg-rose-50', label: 'text-rose-700' },
                                        { bar: 'bg-cyan-500', light: 'bg-cyan-50', label: 'text-cyan-700' },
                                    ];
                                    const c = colors[((categoryPage - 1) * categoryPageSize + i) % colors.length];
                                    const maxCount = Math.max(...categoryData.map((x: any) => x.count), 1);
                                    const pct = (cat.count / maxCount) * 100;

                                    return (
                                        <button
                                            key={cat.category}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.category)}
                                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/40"
                                        >
                                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${c.light}`}>
                                                <span className={`text-xs font-bold ${c.label}`}>{cat.category[0]}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-medium">{cat.category}</p>
                                                    <span className={`text-xs font-semibold tabular-nums ${c.label}`}>{cat.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {categoryPageCount > 1 && (
                                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            disabled={categoryPage === 1}
                                            onClick={() => setCategoryPage((page) => Math.max(page - 1, 1))}
                                        >
                                            Prev
                                        </Button>
                                        <span>Page {categoryPage} / {categoryPageCount}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            disabled={categoryPage === categoryPageCount}
                                            onClick={() => setCategoryPage((page) => Math.min(page + 1, categoryPageCount))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
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
                                <p className="text-xs text-muted-foreground/60 mt-1">No low stock </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lowStockAlerts.slice(0, 5).map((alert: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{alert.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">{alert.location}</p>
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-sm font-semibold tabular-nums text-amber-700">
                                                {alert.stock_level ?? '?'} / {alert.minimum_level ?? '?'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {lowStockAlerts.length > 5 && (
                                    <p className="pt-1 text-center text-xs text-muted-foreground">
                                        +{lowStockAlerts.length - 5} more alerts
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── All Spare Parts Table ── */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[280px]">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>
                <Select value={filterSite} onValueChange={setFilterSite}>
                    <SelectTrigger className="h-8 w-[140px] text-sm">
                        <SelectValue placeholder="All Sites" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Sites</SelectItem>
                        {sites.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 w-[140px] text-sm">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Categories</SelectItem>
                        {categories.map((c: string) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 w-[130px] text-sm">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_used">In Use</SelectItem>
                        <SelectItem value="faulty">Faulty</SelectItem>
                    </SelectContent>
                </Select>
                {(filterSite !== 'all' || filterCategory !== 'all' || filterStatus !== 'all' || search) && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs"
                        onClick={() => {
                            setFilterSite('all'); setFilterCategory('all'); setFilterStatus('all'); setSearch('');
                        }}>
                        Clear
                    </Button>
                )}
                <span className="text-xs text-muted-foreground tabular-nums ml-auto">{filteredParts.length} of {allParts.length} items</span>
            </div>

            <DataTable columns={sparePartColumns} data={filteredParts} hideToolbar />

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

            {/* Category Detail Dialog */}
            <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedCategory} Parts</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] space-y-2 overflow-y-auto py-2">
                        {selectedCategoryParts.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No parts found</p>
                        ) : (
                            selectedCategoryParts.map((part: any) => (
                                <div key={part.id} className="rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{part.name}</p>
                                            <p className="font-mono text-xs text-muted-foreground">{part.part_number || 'No part number'}</p>
                                        </div>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                                            {part.status || 'unknown'}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div><span className="font-medium text-foreground">Site:</span> {part.site_name || 'N/A'}</div>
                                        <div><span className="font-medium text-foreground">Location:</span> {part.location || 'N/A'}</div>
                                        <div><span className="font-medium text-foreground">Used By:</span> {part.used_by_name || '—'}</div>
                                        <div><span className="font-medium text-foreground">Created By:</span> {part.created_by_name || 'N/A'}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSelectedCategory(null)}>
                            Close
                        </Button>
                    </DialogFooter>
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