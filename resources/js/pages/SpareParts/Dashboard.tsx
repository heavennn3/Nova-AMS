import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Package, AlertTriangle, CheckCircle, Plus, Upload, Download, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useRef, useState } from 'react';
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

type ComboOption = { value: string; label: string; color?: string; bg?: string; border?: string };

function SearchCombo({
    value,
    options,
    placeholder,
    onChange,
    buttonClassName = 'h-10',
}: {
    value: string;
    options: ComboOption[];
    placeholder: string;
    onChange: (value: string) => void;
    buttonClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.value === value);
    const filtered = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideTouch = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('pointerdown', closeOnOutsideTouch);
        return () => document.removeEventListener('pointerdown', closeOnOutsideTouch);
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <Button type="button" variant="outline" className={`${buttonClassName} w-full justify-between bg-background font-normal ${selected?.color || ''} ${selected?.bg || ''} ${selected?.border || ''}`} onClick={() => setOpen((current) => !current)}>
                <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>{selected?.label || placeholder}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            {open && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${placeholder.toLowerCase()}`} className="h-10 border-0 px-0 shadow-none focus-visible:ring-0" />
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="px-2 py-3 text-center text-sm text-muted-foreground">No results</div>
                        ) : filtered.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${option.color || ''}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {option.bg && <span className={`h-2 w-2 rounded-full ${option.bg}`} />}
                                    {option.label}
                                </span>
                                {option.value === value && <CheckCircle className={`h-4 w-4 ${option.color || 'text-blue-600'}`} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const categoryOptions = ['RAM', 'MONITOR', 'STORAGE', 'CABLE', 'PSU', 'RJ45', 'CABLE TRACER'].map((category) => ({ value: category, label: category }));
const statusOptions = [
    { value: 'available', label: 'Available', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-200 dark:border-emerald-500/30' },
    { value: 'in_used', label: 'In Use', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-200 dark:border-blue-500/30' },
    { value: 'faulty', label: 'Faulty', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-500/20', border: 'border-rose-200 dark:border-rose-500/30' },
];

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
        router.put(`/spare-parts/${part.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Spare part status updated'),
            onError: () => toast.error('Failed to update status'),
        });
    };

    // ── Filtering ──
    const inUseParts = allParts.filter((p: any) => p.status === 'in_used').length;
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
                <Link href={`/spare-parts/${row.original.id}`} className="font-medium text-foreground transition-colors hover:text-primary hover:underline">
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'part_number',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Part Number" />,
            cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('part_number')}</span>,
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
            cell: ({ row }: any) => <span className="text-sm text-foreground">{String(row.getValue('category') ?? '—').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>,
        },
        {
            accessorKey: 'site_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
            cell: ({ row }: any) => <span className="text-sm text-foreground">{row.getValue('site_name')}</span>,
        },
        {
            accessorKey: 'location',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Location" />,
            cell: ({ row }: any) => <span className="text-sm text-muted-foreground">{row.getValue('location')}</span>,
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
                <div className="flex items-center justify-center gap-1.5">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"
                        onClick={() => openEditDialog(row.original)}
                        aria-label="Edit spare part"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        onClick={() => handleDelete(row.original)}
                        aria-label="Delete spare part"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {[
                    { label: 'Total Items', value: totalParts, icon: Package, bg: 'bg-blue-500/10', text: 'text-blue-600' },
                    { label: 'Available', value: availableParts, icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
                    { label: 'In Used', value: inUseParts, icon: Package, bg: 'bg-blue-500/10', text: 'text-blue-600' },
                    { label: 'Faulty', value: outOfStockParts, icon: AlertTriangle, bg: outOfStockParts > 0 ? 'bg-red-500/20' : 'bg-amber-500/10', text: outOfStockParts > 0 ? 'text-red-600' : 'text-amber-600' },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className={`rounded-lg ${s.bg} p-2.5`}>
                            <s.icon className={`h-5 w-5 ${s.text}`} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold leading-none ${s.text}`}>{s.value}</p>
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
                <div className="w-[180px]">
                    <SearchCombo
                        value={filterSite}
                        placeholder="Sites"
                        buttonClassName="h-8 text-sm"
                        options={[{ value: 'all', label: 'Sites' }, ...sites.map((s: any) => ({ value: String(s.id), label: s.name }))]}
                        onChange={setFilterSite}
                    />
                </div>
                <div className="w-[180px]">
                    <SearchCombo
                        value={filterCategory}
                        placeholder="Categories"
                        buttonClassName="h-8 text-sm"
                        options={[{ value: 'all', label: 'Categories' }, ...categories.map((category) => ({ value: category, label: category }))]}
                        onChange={setFilterCategory}
                    />
                </div>
                <div className="w-[160px]">
                    <SearchCombo
                        value={filterStatus}
                        placeholder="Status"
                        buttonClassName="h-8 text-sm"
                        options={[{ value: 'all', label: 'Status' }, ...statusOptions]}
                        onChange={setFilterStatus}
                    />
                </div>
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
                                    placeholder="e.g DDR4 16GB RAM"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Serial Number *</Label>
                                <Input
                                    required
                                    value={form.data.part_number}
                                    onChange={(e) => form.setData('part_number', e.target.value)}
                                    placeholder="e.g SN-2024-001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <SearchCombo
                                    value={form.data.category}
                                    placeholder="Select category"
                                    options={categoryOptions}
                                    onChange={(v) => form.setData('category', v)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Site</Label>
                                <SearchCombo
                                    value={form.data.site_id}
                                    placeholder="Select site"
                                    options={[{ value: 'all', label: 'Global (All Sites)' }, ...sites.map((site: any) => ({ value: String(site.id), label: site.name }))]}
                                    onChange={(v) => form.setData('site_id', v)}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Place</Label>
                                <Input
                                    required
                                    value={form.data.location}
                                    onChange={(e) => form.setData('location', e.target.value)}
                                    placeholder="e.g Rack A - Shelf 3"
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
                                <SearchCombo
                                    value={editData.category}
                                    placeholder="Select category"
                                    options={categoryOptions}
                                    onChange={(v) => setEditData({ ...editData, category: v })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <SearchCombo
                                    value={editData.status}
                                    placeholder="Select status"
                                    options={statusOptions}
                                    onChange={(v) => setEditData({ ...editData, status: v })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Site</Label>
                                <SearchCombo
                                    value={editData.site_id}
                                    placeholder="Select site"
                                    options={[{ value: 'all', label: 'Global (All Sites)' }, ...sites.map((site: any) => ({ value: String(site.id), label: site.name }))]}
                                    onChange={(v) => setEditData({ ...editData, site_id: v })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Place </Label>
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