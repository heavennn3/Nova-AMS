import { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus, Edit, Trash2, Search, Upload, Package, Building2, Layers, Clock, Loader2,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Papa from 'papaparse';
import { toast } from 'sonner';

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function AssetInventory({
    assets = [],
    sites = [],
    currentSiteId = null,
    assetStatuses = [],
    totalSites = 0,
    typeSummary = [],
    totalRecentAdded = 0,
}: any) {
    const { props } = usePage();
    const { flash } = props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState(currentSiteId || 'all');

    // ── Create Modal ──
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [refs, setRefs] = useState<{ categories: any[]; types: any[]; oems: any[] }>({
        categories: [], types: [], oems: [],
    });
    const [form, setForm] = useState({
        asset_id: '', asset_name: '', category_id: '', type_id: '',
        oem_id: '', location: '', purchase_year: '', serial_number: '',
        part_number: '', quantity: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const openCreateModal = useCallback(async () => {
        setShowCreate(true);
        setFormErrors({});
        setForm({ asset_id: '', asset_name: '', category_id: '', type_id: '', oem_id: '', location: '', purchase_year: '', serial_number: '', part_number: '', quantity: '' });
        if (!refs.categories.length || !refs.types.length || !refs.oems.length) {
            try {
                const [catRes, typeRes, oemRes] = await Promise.all([
                    fetch('/api/references/categories'),
                    fetch('/api/references/types'),
                    fetch('/api/references/oems'),
                ]);
                setRefs({
                    categories: await catRes.json(),
                    types: await typeRes.json(),
                    oems: await oemRes.json(),
                });
            } catch {
                toast.error('Failed to load reference data');
            }
        }
    }, [refs]);

    const handleFormChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.asset_id.trim()) {
            setFormErrors({ asset_id: 'Asset ID is required' });
            return;
        }
        setCreating(true);
        try {
            const res = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ ...form, site_id: siteFilter === 'all' ? null : parseInt(siteFilter) }),
            });
            if (!res.ok) {
                const err = await res.json();
                if (err.errors) {
                    const fieldErrors: Record<string, string> = {};
                    for (const [k, msgs] of Object.entries(err.errors)) {
                        fieldErrors[k] = (msgs as string[])[0];
                    }
                    setFormErrors(fieldErrors);
                } else {
                    toast.error(err.message || 'Failed to create asset');
                }
                return;
            }
            toast.success('Asset created!');
            setShowCreate(false);
            router.reload({ only: ['assets'] });
        } catch {
            toast.error('Network error');
        } finally {
            setCreating(false);
        }
    };

    const handleSiteFilterChange = (value: string) => {
        setSiteFilter(value);
        if (value === 'all') {
            router.get('/asset-inventory', {}, { preserveState: true, replace: true });
        } else {
            router.get('/asset-inventory', { site_id: value }, { preserveState: true, replace: true });
        }
    };

    const columns = useMemo(() => {
        const cols: any[] = [
            {
                id: 'no',
                header: '#',
                cell: ({ row }: any) => <span className="text-muted-foreground text-sm">{row.index + 1}</span>,
                enableSorting: false,
            },
            {
                accessorKey: 'asset_id',
                header: 'Asset ID',
                cell: ({ row }: any) => (
                    <Link href={`/assets/${row.original.id}`} className="text-primary hover:underline font-mono font-semibold">
                        {row.getValue('asset_id') ?? '—'}
                    </Link>
                ),
            },
            { accessorKey: 'asset_name', header: 'Asset Name', headerText: 'Asset Name' },
            { accessorKey: 'category', header: 'Category', headerText: 'Category' },
            { accessorKey: 'type', header: 'Type', headerText: 'Type' },
            { accessorKey: 'location', header: 'Location', headerText: 'Location' },
            { accessorKey: 'oem', header: 'OEM', headerText: 'OEM' },
            { accessorKey: 'purchase_year', header: 'Purchase Year', headerText: 'Purchase Year' },
            { accessorKey: 'serial_number', header: 'Serial Number', headerText: 'Serial Number' },
            { accessorKey: 'part_number', header: 'Part Number', headerText: 'Part Number' },
            {
                id: 'status',
                accessorKey: 'status',
                filterFn: (row: any, id: string, filterValue: string[]) => filterValue.includes(row.getValue(id)),
                header: 'Status',
                cell: ({ row }: any) => {
                    const val = row.getValue('status') ?? 'stored';
                    const bgColor = row.original.status_color || '#6B7280';
                    return (
                        <span
                            className="inline-block rounded-md px-2.5 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: bgColor }}
                        >
                            {val}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => (
                    <div className="flex items-center space-x-2">
                        <Link href={`/assets/${row.original.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                                <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600"
                            onClick={() => {
                                if (confirm('Delete this asset?')) {
                                    router.delete(`/assets/${row.original.id}`, {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                    </div>
                ),
            },
        ];

        return cols;
    }, []);

    const filteredAssets = useMemo(() => {
        let result = (assets || []).filter((a: any) => {
            if (siteFilter === 'all') return true;
            return String(a.site_id) === siteFilter;
        });

        const q = search.toLowerCase();
        if (q) {
            const searchKeys = ['asset_id', 'asset_name', 'category', 'type', 'location', 'oem', 'serial_number', 'part_number'];
            result = result.filter((a: any) =>
                searchKeys.some((key: string) => {
                    const v = a[key];
                    return v && String(v).toLowerCase().includes(q);
                }),
            );
        }

        return result;
    }, [assets, search, siteFilter]);

    // ── CSV Import ──

    const confirmImport = (importedData: any[]) => {
        if (!importedData || importedData.length === 0) {
            toast.error('CSV file is empty.');
            return;
        }

        router.post(
            '/assets/import-bulk',
            { assets: importedData, site_id: siteFilter === 'all' ? null : siteFilter },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Imported ${importedData.length} assets!`);
                    router.reload({ only: ['assets'] });
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
                complete: (results) => {
                    confirmImport(results.data);
                },
            });
        };
        input.click();
    };

    const downloadCsvTemplate = () => {
        const headers = ['Asset ID', 'Asset Name', 'Category', 'Type', 'Location', 'OEM', 'Purchase Year', 'Serial Number', 'Part Number', 'Quantity', 'Status'];
        const sampleData = ['', '', '', '', '', '', '', '', '', '', ''];
        const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'asset_inventory_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderField = (key: string, label: string, required = false, type = 'text') => (
        <div className="space-y-1.5">
            <Label htmlFor={`create-${key}`} className="text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={`create-${key}`}
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => handleFormChange(key, e.target.value)}
                className="h-9"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {formErrors[key] && <p className="text-xs text-red-500">{formErrors[key]}</p>}
        </div>
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asset Inventory</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
                        <Upload className="mr-2 h-4 w-4" /> CSV Template
                    </Button>
                    <Button variant="outline" size="sm" onClick={openFilePicker}>
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                    <Button size="sm" onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" /> New Asset
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-2xl font-bold">{assets.length}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Sites</p>
                        <p className="text-2xl font-bold">{totalSites}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-violet-500/10 p-3">
                        <Layers className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Type Summary</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                            {typeSummary.slice(0, 3).map((t: any) => (
                                <span key={t.id}>
                                    <span className="font-semibold">{t.assets_count}</span> {t.name}
                                </span>
                            ))}
                            {typeSummary.length > 3 && (
                                <span className="text-muted-foreground/60">+{typeSummary.length - 3} more</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Recently Added</p>
                        <p className="text-2xl font-bold">{totalRecentAdded}</p>
                        <p className="text-xs text-muted-foreground">last 30 days</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[280px]">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>

                {sites.length > 0 && (
                    <Select value={siteFilter} onValueChange={handleSiteFilterChange}>
                        <SelectTrigger className="h-8 w-[200px] text-sm">
                            <SelectValue placeholder="All Sites" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sites</SelectItem>
                            {sites.map((site: any) => (
                                <SelectItem key={site.id} value={String(site.id)}>
                                    {site.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <DataTable columns={columns} data={filteredAssets} hideToolbar />

            {/* ── Create Asset Modal ── */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create New Asset</DialogTitle>
                            <DialogDescription>
                                Add a new asset to the inventory.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {renderField('asset_id', 'Asset ID', true)}
                                {renderField('asset_name', 'Asset Name')}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-category" className="text-sm font-medium">Category</Label>
                                    <Select
                                        value={form.category_id}
                                        onValueChange={(val) => handleFormChange('category_id', val)}
                                    >
                                        <SelectTrigger id="create-category" className="h-9">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {refs.categories.map((c: any) => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-type" className="text-sm font-medium">Type</Label>
                                    <Select
                                        value={form.type_id}
                                        onValueChange={(val) => handleFormChange('type_id', val)}
                                    >
                                        <SelectTrigger id="create-type" className="h-9">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {refs.types.map((t: any) => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-oem" className="text-sm font-medium">OEM</Label>
                                    <Select
                                        value={form.oem_id}
                                        onValueChange={(val) => handleFormChange('oem_id', val)}
                                    >
                                        <SelectTrigger id="create-oem" className="h-9">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {refs.oems.map((o: any) => (
                                                <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderField('location', 'Location')}
                                {renderField('purchase_year', 'Purchase Year', false, 'number')}
                                {renderField('serial_number', 'Serial Number')}
                                {renderField('part_number', 'Part Number')}
                                {renderField('quantity', 'Quantity', false, 'number')}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={creating}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={creating}>
                                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {creating ? 'Creating...' : 'Create Asset'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
