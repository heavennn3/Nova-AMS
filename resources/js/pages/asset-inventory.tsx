import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus, Edit, Trash2, Search, Upload, Package, Building2, Layers, Clock, Loader2,
    HandCoins, Calendar, User, AlertTriangle,
} from 'lucide-react';
import Papa from 'papaparse';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
    loanStats = { active: 0, overdue: 0, pending: 0 },
}: any) {
    const { props } = usePage();
    const { flash, auth } = props as any;
    const isAdmin = auth?.user?.is_admin ?? auth?.user?.roles?.includes('Admin') ?? false;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState(currentSiteId || 'all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // ── Create Asset Modal ──
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

    // ── Edit Asset Modal ──
    const [showEdit, setShowEdit] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        asset_id: '', asset_name: '', category_id: '', type_id: '',
        oem_id: '', location: '', purchase_year: '', serial_number: '',
        part_number: '', quantity: '',
    });
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

    // ── Loan Request Modal ──
    const [showLoan, setShowLoan] = useState(false);
    const [loanSubmitting, setLoanSubmitting] = useState(false);
    const [loanForm, setLoanForm] = useState({
        asset_ids: [] as number[],
        expected_return_date: '',
        purpose: '',
        notes: '',
    });

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

        if (formErrors[key]) {
            setFormErrors((prev) => ({ ...prev, [key]: '' }));
        }
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

    const openEditModal = useCallback(async (asset: any) => {
        setEditingAsset(asset);
        setEditFormErrors({});
        setEditForm({
            asset_id: asset.asset_id || '',
            asset_name: asset.asset_name || '',
            category_id: asset.category_id?.toString() || '',
            type_id: asset.type_id?.toString() || '',
            oem_id: asset.oem_id?.toString() || '',
            location: asset.location || '',
            purchase_year: asset.purchase_year?.toString() || '',
            serial_number: asset.serial_number || '',
            part_number: asset.part_number || '',
            quantity: asset.quantity?.toString() || '',
        });
        setShowEdit(true);

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

    const handleEditFormChange = (key: string, value: string) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));

        if (editFormErrors[key]) {
            setEditFormErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editForm.asset_id.trim()) {
            setEditFormErrors({ asset_id: 'Asset ID is required' });
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch(`/api/assets/${editingAsset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.errors) {
                    const fieldErrors: Record<string, string> = {};
                    for (const [key, messages] of Object.entries(data.errors)) {
                        fieldErrors[key] = (messages as string[])[0];
                    }
                    setEditFormErrors(fieldErrors);
                } else {
                    toast.error(data.message || 'Failed to update asset');
                }
                return;
            }

            toast.success('Asset updated!');
            setShowEdit(false);
            router.reload({ only: ['assets'] });
        } catch {
            toast.error('Network error');
        } finally {
            setUpdating(false);
        }
    };

    const openLoanModal = () => {
        setLoanForm({ asset_ids: [], expected_return_date: '', purpose: '', notes: '' });
        setShowLoan(true);
    };

    const toggleLoanAsset = (id: number) => {
        setLoanForm(prev => ({
            ...prev,
            asset_ids: prev.asset_ids.includes(id)
                ? prev.asset_ids.filter(a => a !== id)
                : [...prev.asset_ids, id],
        }));
    };

    const submitLoan = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loanForm.asset_ids.length === 0) {
            toast.error('Pick at least one asset.');

            return;
        }

        if (!loanForm.expected_return_date) {
            toast.error('Expected return date required.');

            return;
        }

        if (!loanForm.purpose.trim()) {
            toast.error('Purpose required.');

            return;
        }

        setLoanSubmitting(true);

        try {
            const res = await fetch('/api/loans/quick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify(loanForm),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Failed to submit loan');

                return;
            }

            toast.success(data.message || 'Loan request submitted!');
            setShowLoan(false);
            router.reload({ only: ['assets'] });
        } catch {
            toast.error('Network error');
        } finally {
            setLoanSubmitting(false);
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
                header: 'No',
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
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-blue-600"
                            onClick={() => openEditModal(row.original)}
                        >
                            <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
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
    }, [openEditModal]);

    const filteredAssets = useMemo(() => {
        let result = (assets || []).filter((a: any) => {
            if (siteFilter === 'all') {
                return true;
            }

            return String(a.site_id) === siteFilter;
        });

        if (categoryFilter !== 'all') {
            result = result.filter((a: any) => String(a.category_name ?? a.category ?? '').toLowerCase() === categoryFilter);
        }

        if (typeFilter !== 'all') {
            result = result.filter((a: any) => String(a.type_name ?? a.type ?? '').toLowerCase() === typeFilter);
        }

        if (statusFilter !== 'all') {
            result = result.filter((a: any) => String(a.status ?? a.asset_status ?? '').toLowerCase() === statusFilter);
        }

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
    }, [assets, search, siteFilter, categoryFilter, typeFilter, statusFilter]);

    // ── Available-for-loan subset ──
    const availableForLoan = useMemo(() => {
        return filteredAssets.filter((a: any) =>
            !a.loan_status && String(a.status ?? '').toLowerCase() === 'stored'
        );
    }, [filteredAssets]);

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

            if (!file) {
                return;
            }

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

    const renderEditField = (key: string, label: string, required = false, type = 'text') => (
        <div className="space-y-1.5">
            <Label htmlFor={`edit-${key}`} className="text-sm font-medium">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </Label>
            <Input
                id={`edit-${key}`}
                type={type}
                value={editForm[key as keyof typeof editForm]}
                onChange={(e) => handleEditFormChange(key, e.target.value)}
                className="h-9"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {editFormErrors[key] && <p className="text-xs text-red-500">{editFormErrors[key]}</p>}
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

                    <Button variant="outline" size="sm" onClick={openFilePicker}>
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                    <Button size="sm" onClick={openLoanModal}>
                        <HandCoins className="mr-2 h-4 w-4" /> Request Loan
                    </Button>
                    <Button size="sm" onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" /> New Asset
                    </Button>
                </div>
            </div>

            {/* Metrics cards with loan stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                    <div className="rounded-full bg-emerald-500/10 p-3">
                        <HandCoins className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active Loans</p>
                        <p className="text-2xl font-bold">{loanStats.active}</p>
                        {loanStats.pending > 0 && (
                            <p className="text-xs text-amber-600 mt-0.5">{loanStats.pending} pending</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className={`rounded-full p-3 ${loanStats.overdue > 0 ? 'bg-red-500/20' : 'bg-amber-500/10'}`}>
                        <AlertTriangle className={`h-6 w-6 ${loanStats.overdue > 0 ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                        <p className={`text-2xl font-bold ${loanStats.overdue > 0 ? 'text-red-600' : ''}`}>
                            {loanStats.overdue}
                        </p>
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

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-[180px] text-sm">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {[...(new Set((assets || []).map((a: any) => String(a.category_name ?? a.category ?? '').trim()).filter(Boolean)))].map((category) => (
                            <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 w-[180px] text-sm">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {[...(new Set((assets || []).map((a: any) => String(a.type_name ?? a.type ?? '').trim()).filter(Boolean)))].map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[180px] text-sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Status</SelectItem>
                        {[...(new Set((assets || []).map((a: any) => String(a.status ?? a.asset_status ?? '').trim()).filter(Boolean)))].map((status) => (
                            <SelectItem key={status} value={status.toLowerCase()}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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

            {/* ── Edit Asset Modal ── */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleUpdate}>
                        <DialogHeader>
                            <DialogTitle>Edit Asset</DialogTitle>
                            <DialogDescription>
                                Update the details for {editingAsset?.asset_id || 'this asset'}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {renderEditField('asset_id', 'Asset ID', true)}
                                {renderEditField('asset_name', 'Asset Name')}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-category" className="text-sm font-medium">Category</Label>
                                    <Select value={editForm.category_id} onValueChange={(value) => handleEditFormChange('category_id', value)}>
                                        <SelectTrigger id="edit-category" className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {refs.categories.map((category: any) => (
                                                <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editFormErrors.category_id && <p className="text-xs text-red-500">{editFormErrors.category_id}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-type" className="text-sm font-medium">Type</Label>
                                    <Select value={editForm.type_id} onValueChange={(value) => handleEditFormChange('type_id', value)}>
                                        <SelectTrigger id="edit-type" className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {refs.types.map((type: any) => (
                                                <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editFormErrors.type_id && <p className="text-xs text-red-500">{editFormErrors.type_id}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-oem" className="text-sm font-medium">OEM</Label>
                                    <Select value={editForm.oem_id} onValueChange={(value) => handleEditFormChange('oem_id', value)}>
                                        <SelectTrigger id="edit-oem" className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {refs.oems.map((oem: any) => (
                                                <SelectItem key={oem.id} value={String(oem.id)}>{oem.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editFormErrors.oem_id && <p className="text-xs text-red-500">{editFormErrors.oem_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {renderEditField('location', 'Location')}
                                {renderEditField('purchase_year', 'Purchase Year', false, 'number')}
                                {renderEditField('serial_number', 'Serial Number')}
                                {renderEditField('part_number', 'Part Number')}
                                {renderEditField('quantity', 'Quantity', false, 'number')}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEdit(false)} disabled={updating}>Cancel</Button>
                            <Button type="submit" disabled={updating}>
                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {updating ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Loan Request Modal ── */}
            <Dialog open={showLoan} onOpenChange={setShowLoan}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={submitLoan}>
                        <DialogHeader>
                            <DialogTitle>Request Asset Loan</DialogTitle>
                            <DialogDescription>
                                Select available asset(s) to request a loan. Admin will review your request.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Asset picker */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select Assets <span className="text-red-500">*</span></Label>
                                <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                                    {availableForLoan.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground text-center">No available assets.</p>
                                    ) : (
                                        availableForLoan.map((asset: any) => (
                                            <label
                                                key={asset.id}
                                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-muted/30 ${loanForm.asset_ids.includes(asset.id) ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={loanForm.asset_ids.includes(asset.id)}
                                                    onChange={() => toggleLoanAsset(asset.id)}
                                                />
                                                <span className="font-mono text-xs font-semibold">{asset.asset_id}</span>
                                                <span className="text-sm text-muted-foreground">{asset.asset_name || asset.type}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {loanForm.asset_ids.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{loanForm.asset_ids.length} asset(s) selected</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Loan Date</Label>
                                    <Input
                                        type="date"
                                        value={new Date().toISOString().split('T')[0]}
                                        disabled
                                        className="bg-muted/30"
                                    />
                                    <p className="text-xs text-muted-foreground">Starts today</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                        Expected Return Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="date"
                                        value={loanForm.expected_return_date}
                                        onChange={(e) => setLoanForm(prev => ({ ...prev, expected_return_date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Purpose <span className="text-red-500">*</span></Label>
                                <Textarea
                                    value={loanForm.purpose}
                                    onChange={(e) => setLoanForm(prev => ({ ...prev, purpose: e.target.value }))}
                                    placeholder="Why do you need this asset?"
                                    className="min-h-[60px]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Notes</Label>
                                <Textarea
                                    value={loanForm.notes}
                                    onChange={(e) => setLoanForm(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional info (optional)"
                                    className="min-h-[60px]"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowLoan(false)} disabled={loanSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loanSubmitting || loanForm.asset_ids.length === 0}>
                                {loanSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loanSubmitting ? 'Submitting...' : `Submit Loan (${loanForm.asset_ids.length})`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
