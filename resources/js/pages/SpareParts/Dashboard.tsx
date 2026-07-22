import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Package, AlertTriangle, CheckCircle, Plus, Upload, Download, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const roles = usePage<any>().props.auth?.user?.roles ?? [];
    const canManageSpareParts = roles.includes('Admin') || roles.includes('Manager');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [importSiteId, setImportSiteId] = useState('all');
    const [filterSite, setFilterSite] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [categoryPage, setCategoryPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [editPart, setEditPart] = useState<any | null>(null);
    const [editData, setEditData] = useState({
        name: '',
        part_number: '',
        category: '',
        location: '',
        site_id: 'all',
        status: 'available',
    });

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

    const openEditDialog = (part: any) => {
        setEditPart(part);
        setEditData({
            name: part.name || '',
            part_number: part.part_number || '',
            category: part.category || '',
            location: part.location || '',
            site_id: part.site_id ? String(part.site_id) : 'all',
            status: part.status || 'available',
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPart) {
            return;
        }

        router.put(`/spare-parts/${editPart.id}`, {
            ...editData,
            site_id: editData.site_id === 'all' ? null : editData.site_id,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditPart(null);
                toast.success('Spare part updated successfully');
            },
            onError: () => toast.error('Failed to update spare part'),
        });
    };

    const handleDelete = (part: any) => {
        if (!confirm(`Delete spare part "${part.name}"?`)) {
            return;
        }

        router.delete(`/spare-parts/${part.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Spare part deleted successfully'),
            onError: () => toast.error('Failed to delete spare part'),
        });
    };

    const updateStatus = (part: any, status: string) => {
        router.put(`/spare-parts/${part.id}`, {
            name: part.name,
            part_number: part.part_number,
            category: part.category,
            location: part.location,
            site_id: part.site_id ?? null,
            status,
            used_by: part.used_by ?? null,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Spare part status updated'),
            onError: () => toast.error('Failed to update status'),
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
                const statuses: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
                    available: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle, label: 'Available' },
                    in_used: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', icon: Package, label: 'In Use' },
                    faulty: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: AlertTriangle, label: 'Faulty' },
                };
                const cfg = statuses[status] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Package, label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : '—' };
                const Icon = cfg.icon;
                const badge = (
                    <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} grid w-[112px] grid-cols-[16px_1fr_16px] items-center gap-1`}>
                        <span className="flex size-4 items-center justify-center">
                            <Icon className="size-3 shrink-0" />
                        </span>
                        <span className="truncate text-center">{cfg.label}</span>
                        <span className="flex size-4 items-center justify-center">
                            {canManageSpareParts && <ChevronDown className="size-3 opacity-60" />}
                        </span>
                    </Badge>
                );

                if (!canManageSpareParts) return <div className="flex justify-center">{badge}</div>;

                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button">{badge}</button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                {Object.entries(statuses).map(([value, option]) => {
                                    const OptionIcon = option.icon;
                                    return (
                                        <DropdownMenuItem key={value} onClick={() => updateStatus(row.original, value)}>
                                            <OptionIcon className={`h-4 w-4 ${option.color}`} />
                                            {option.label}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
        ...(canManageSpareParts ? [{
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openEditDialog(row.original)}>
                        <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                </div>
            ),
        }] : []),
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Spare Parts Dashboard" />

            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Spare Parts Inventory
                    </h1>
                    <p className="text-sm text-muted-foreground">View, manage, and monitor all spare parts</p>
                </div>

                {canManageSpareParts && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                            onClick={openFilePicker}
                        >
                            <Upload className="h-4 w-4" /> Import CSV
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            onClick={() => {
                                form.reset();
                                setCreateDialogOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Spare Part
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    { label: 'Total Items', value: totalParts, icon: Package, bg: 'bg-blue-500/10', text: 'text-blue-600' },
                    { label: 'Available', value: availableParts, icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
                    { label: 'Faulty', value: outOfStockParts, icon: AlertTriangle, bg: outOfStockParts > 0 ? 'bg-red-500/20' : 'bg-amber-500/10', text: outOfStockParts > 0 ? 'text-red-600' : 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className={`rounded-lg ${s.bg} p-2.5`}>
                            <s.icon className={`h-5 w-5 ${s.text}`} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold leading-none ${outOfStockParts > 0 && s.label === 'Faulty' ? 'text-red-600' : 'text-foreground'}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
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

            <DataTable columns={sparePartColumns} data={filteredParts} hideToolbar={!canManageSpareParts} />

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

            <Dialog open={!!editPart} onOpenChange={(open) => !open && setEditPart(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Spare Part</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input required value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Part Number *</Label>
                                <Input required value={editData.part_number} onChange={(e) => setEditData({ ...editData, part_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select value={editData.category} onValueChange={(v) => setEditData({ ...editData, category: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {['RAM', 'MONITOR', 'STORAGE', 'CABLE', 'PSU', 'RJ45', 'CABLE TRACER'].map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="in_used">In Used</SelectItem>
                                        <SelectItem value="faulty">Faulty</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Site</Label>
                                <Select value={editData.site_id} onValueChange={(v) => setEditData({ ...editData, site_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global (All Sites)</SelectItem>
                                        {sites.map((site: any) => (
                                            <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Place (Where Kept) *</Label>
                                <Input required value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditPart(null)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
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
                                <div key={part.id} className="rounded-lg border border-border bg-card p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{part.name}</p>
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