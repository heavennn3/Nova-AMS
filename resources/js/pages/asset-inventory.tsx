import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus, Edit, Trash2, Search, Upload, Package, Building2, Layers, Clock, Loader2,
    HandCoins, Calendar, User, AlertTriangle, Download, FileText, CheckCircle2, XCircle, ChevronDown,
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

function getAssetStatusConfig(status: string) {
    const normalized = status?.toLowerCase();
    const config: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
        available: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2, label: 'Available' },
        stored: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: Package, label: 'Stored' },
        moved: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', icon: Clock, label: 'Moved' },
        used: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', icon: User, label: 'Used' },
        repair: { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', icon: AlertTriangle, label: 'Repair' },
        faulty: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: XCircle, label: 'Faulty' },
        not_updated: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Clock, label: 'Not Updated' },
    };

    return config[normalized] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Clock, label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : '—' };
}

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export default function AssetInventory({
    assets = [],
    sites = [],
    categories = [],
    types = [],
    oems = [],
    currentSiteId = null,
    assetStatuses = [],
    totalSites = 0,
    typeSummary = [],
    totalRecentAdded = 0,
    loanStats = { active: 0, overdue: 0, pending: 0 },
}: any) {
    const { props } = usePage();
    const { flash, auth } = props as any;
    const roles = auth?.user?.roles ?? [];
    const canManageAssets = roles.includes('Admin') || roles.includes('Manager');

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

    // create 
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [refs] = useState<{ categories: any[]; types: any[]; oems: any[] }>({
        categories, types, oems,
    });
    const [form, setForm] = useState({
        asset_id: '', asset_name: '', category_id: '', type_id: '',
        oem_id: '', location: '', purchase_year: '', serial_number: '',
        part_number: '', quantity: '1', site_id: currentSiteId ? String(currentSiteId) : '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // update
    const [showEdit, setShowEdit] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        asset_id: '', asset_name: '', category_id: '', type_id: '',
        oem_id: '', location: '', purchase_year: '', serial_number: '',
        part_number: '', quantity: '1', site_id: '',
    });
    const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});


    const closeDialogSafely = (close: () => void) => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        window.setTimeout(close, 0);
    };

    const [showLoan, setShowLoan] = useState(false);
    const [loanSubmitting, setLoanSubmitting] = useState(false);
    const [loanForm, setLoanForm] = useState({
        asset_ids: [] as number[],
        expected_return_date: '',
        purpose: '',
        notes: '',
    });

    const openCreateModal = useCallback(() => {
        setShowCreate(true);
        setFormErrors({});
        setForm({ asset_id: '', asset_name: '', category_id: '', type_id: '', oem_id: '', location: '', purchase_year: '', serial_number: '', part_number: '', quantity: '1', site_id: currentSiteId ? String(currentSiteId) : '' });
    }, [currentSiteId]);

    const handleFormChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));

        if (formErrors[key]) {
            setFormErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.asset_id.trim()) {
            setFormErrors({ asset_id: 'Asset ID is required' });

            return;
        }

        if (!form.site_id) {
            setFormErrors({ site_id: 'Site is required' });

            return;
        }

        setCreating(true);
        router.post('/assets', {
            ...form,
            quantity: 1,
            site_id: Number(form.site_id),
            return_to: 'asset-inventory',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                closeDialogSafely(() => setShowCreate(false));
                toast.success('Asset created!');
            },
            onError: (errors) => setFormErrors(errors as Record<string, string>),
            onFinish: () => setCreating(false),
        });
    };

    const openEditModal = useCallback((asset: any) => {
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
            quantity: '1',
            site_id: asset.site_id?.toString() || '',
        });
        setShowEdit(true);
    }, []);

    const handleEditFormChange = (key: string, value: string) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));

        if (editFormErrors[key]) {
            setEditFormErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editForm.asset_id.trim()) {
            setEditFormErrors({ asset_id: 'Asset ID is required' });
            return;
        }

        if (!editForm.site_id) {
            setEditFormErrors({ site_id: 'Site is required' });
            return;
        }

        setUpdating(true);
        router.put(`/assets/${editingAsset.id}`, { ...editForm, quantity: 1, site_id: Number(editForm.site_id), return_to: 'asset-inventory' }, {
            preserveScroll: true,
            onSuccess: () => {
                closeDialogSafely(() => setShowEdit(false));
                toast.success('Asset updated!');
            },
            onError: (errors) => setEditFormErrors(errors as Record<string, string>),
            onFinish: () => setUpdating(false),
        });
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

    const updateAssetStatus = (assetId: number, statusId: string) => {
        router.patch(`/assets/${assetId}/status`, { status_id: Number(statusId) }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Asset status updated'),
            onError: () => toast.error('Failed to update asset status'),
        });
    };

    const columns = useMemo(() => {
        const cols: any[] = [
            {
                id: 'no',
                header: 'No',
                cell: ({ row }: any) => <span className="text-muted-foreground text-sm font-medium">{row.index + 1}</span>,
                enableSorting: false,
            },
            {
                accessorKey: 'asset_id',
                header: 'Asset ID',
                cell: ({ row }: any) => (
                    <Link href={`/assets/${row.original.id}`} className="text-primary hover:underline font-mono font-medium hover:text-primary/80 transition-colors">
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
                    const cfg = getAssetStatusConfig(String(val));
                    const Icon = cfg.icon;

                    return (
                        <div className="flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button">
                                        <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} grid w-[112px] grid-cols-[16px_1fr_16px] items-center gap-1`}>
                                            <span className="flex size-4 items-center justify-center">
                                                <Icon className="size-3 shrink-0" />
                                            </span>
                                            <span className="truncate text-center">{cfg.label}</span>
                                            <span className="flex size-4 items-center justify-center">
                                                <ChevronDown className="size-3 shrink-0" />
                                            </span>
                                        </Badge>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center" className="w-40">
                                    {assetStatuses.map((status: any) => {
                                        const itemCfg = getAssetStatusConfig(String(status.name));
                                        const ItemIcon = itemCfg.icon;

                                        return (
                                            <DropdownMenuItem
                                                key={status.id}
                                                onClick={() => updateAssetStatus(row.original.id, String(status.id))}
                                                className="cursor-pointer p-1"
                                            >
                                                <span className={`${itemCfg.color} ${itemCfg.border} ${itemCfg.bg} flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold`}>
                                                    <ItemIcon className="h-3.5 w-3.5" />
                                                    {itemCfg.label}
                                                </span>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },

            ...(canManageAssets ? [{
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => (
                    <div className="flex items-center justify-start gap-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"
                                    onClick={() => openEditModal(row.original)}
                                    aria-label="Edit asset"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                    onClick={() => {
                                        if (confirm('Delete this asset?')) {
                                            router.delete(`/assets/${row.original.id}`, {
                                                preserveScroll: true,
                                                onSuccess: () => toast.success('Asset deleted successfully.'),
                                            });
                                        }
                                    }}
                                    aria-label="Delete asset"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    </div>
                ),
            }] : []),
        ];

        return cols;
    }, [assetStatuses, openEditModal, canManageAssets]);

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

    const totalStored = useMemo(() => {
        return (assets || []).filter((asset: any) =>
            String(asset.status ?? asset.asset_status ?? '').toLowerCase() === 'stored'
        ).length;
    }, [assets]);

    const totalFaulty = useMemo(() => {
        return (assets || []).filter((asset: any) =>
            String(asset.status ?? asset.asset_status ?? '').toLowerCase() === 'faulty'
        ).length;
    }, [assets]);

    const totalMoved = useMemo(() => {
        return (assets || []).filter((asset: any) =>
            String(asset.status ?? asset.asset_status ?? '').toLowerCase() === 'moved'
        ).length;
    }, [assets]);

    const totalRepair = useMemo(() => {
        return (assets || []).filter((asset: any) =>
            String(asset.status ?? asset.asset_status ?? '').toLowerCase() === 'repair'
        ).length;
    }, [assets]);

    const totalUsed = useMemo(() => {
        return (assets || []).filter((asset: any) =>
            String(asset.status ?? asset.asset_status ?? '').toLowerCase() === 'used'
        ).length;
    }, [assets]);

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

    const exportHeaders = ['Asset ID', 'Asset Name', 'Category', 'Type', 'Site', 'Location', 'OEM', 'Purchase Year', 'Serial Number', 'Part Number', 'Quantity', 'Status'];
    const selectedSiteName = siteFilter === 'all'
        ? 'All Sites'
        : sites.find((site: any) => String(site.id) === String(siteFilter))?.name || 'Selected Site';
    const exportRows = filteredAssets.map((asset: any) => [
        asset.asset_id,
        asset.asset_name,
        asset.category_name ?? asset.category,
        asset.type_name ?? asset.type,
        asset.site_name,
        asset.location,
        asset.oem_name ?? asset.oem,
        asset.purchase_year,
        asset.serial_number,
        asset.part_number,
        asset.quantity,
        asset.status ?? asset.asset_status,
    ].map((value) => String(value ?? '')));

    const exportCsv = () => {
        const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const csvContent = [exportHeaders, ...exportRows]
            .map((row) => row.map(escapeCsv).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asset_inventory_${selectedSiteName.replace(/\s+/g, '_').toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPdf = () => {
        const rows = exportRows.map((row: string[]) => `
            <tr>${row.map((value: string) => `<td>${value.replace(/[&<>]/g, (char: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char as '&' | '<' | '>'] || char))}</td>`).join('')}</tr>
        `).join('');
        const win = window.open('', '_blank');

        if (!win) {
            toast.error('Popup blocked. Allow popups to export PDF.');
            return;
        }

        win.document.write(`
            <html>
                <head>
                    <title>Asset Inventory - ${selectedSiteName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
                        h1 { margin: 0 0 4px; font-size: 22px; }
                        .meta { color: #6b7280; margin-bottom: 18px; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th { background: #f3f4f6; text-align: left; }
                        th, td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Asset Inventory</h1>
                    <div class="meta">Site: ${selectedSiteName} · Total: ${filteredAssets.length} · Exported: ${new Date().toLocaleString()}</div>
                    <table>
                        <thead><tr>${exportHeaders.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
                        <tbody>${rows || `<tr><td colspan="${exportHeaders.length}">No assets found</td></tr>`}</tbody>
                    </table>
                    <script>window.onload = () => { window.print(); };</script>
                </body>
            </html>
        `);
        win.document.close();
    };

    const SearchCombo = ({
        id,
        label,
        required = false,
        value,
        options,
        placeholder = 'Select',
        error,
        onChange,
    }: {
        id: string;
        label: string;
        required?: boolean;
        value: string;
        options: any[];
        placeholder?: string;
        error?: string;
        onChange: (value: string) => void;
    }) => {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState('');
        const selected = options.find((option) => String(option.id) === value);
        const filtered = options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase()));

        return (
            <div className="relative space-y-1.5">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}{required && <span className="ml-1 text-red-500">*</span>}
                </Label>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between text-sm font-normal"
                    onClick={() => setOpen((current) => !current)}
                >
                    <span className={selected ? '' : 'text-muted-foreground'}>{selected?.name || placeholder}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
                {open && (
                    <div className="absolute z-[70] mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                                autoFocus
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={`Search ${label.toLowerCase()}`}
                                className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                            />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                            {filtered.length === 0 ? (
                                <div className="px-2 py-3 text-center text-sm text-muted-foreground">No results</div>
                            ) : (
                                filtered.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            onChange(String(option.id));
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                    >
                                        <span>{option.name}</span>
                                        {String(option.id) === value && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
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
                className="h-10 text-sm"
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
                className="h-10 text-sm"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {editFormErrors[key] && <p className="text-xs text-red-500">{editFormErrors[key]}</p>}
        </div>
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Asset Inventory</h1>
                    <p className="text-sm text-muted-foreground">View, manage, and monitor all registered ICT assets</p>
                </div>
                {canManageAssets && (
                    <div className="flex items-center gap-2">

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                            onClick={openFilePicker}
                        >
                            <Upload className="h-4 w-4" />
                            Import CSV
                        </Button>

                        <Button
                            size="sm"
                            className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            onClick={openCreateModal}
                        >
                            <Plus className="h-4 w-4" />
                            New Asset
                        </Button>
                    </div>
                )}
            </div>

            {/* Metrics cards with loan stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="rounded-lg bg-blue-500/10 p-2.5">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Total Assets</p>
                        <p className="text-2xl font-bold leading-none text-foreground">{assets.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="rounded-lg bg-emerald-500/10 p-2.5">
                        <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Stored Items</p>
                        <p className="text-2xl font-bold leading-none text-foreground">{totalStored}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className={`rounded-lg p-2.5 ${totalFaulty > 0 ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                        <AlertTriangle className={`h-5 w-5 ${totalFaulty > 0 ? 'text-rose-600' : 'text-rose-600'}`} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Faulty Items</p>
                        <p className={`text-2xl font-bold leading-none ${totalFaulty > 0 ? 'text-red-600' : 'text-foreground'}`}>
                            {totalFaulty}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="rounded-lg bg-violet-500/10 p-2.5">
                        <Clock className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Moved Items</p>
                        <p className="text-2xl font-bold leading-none text-foreground">{totalMoved}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="rounded-lg bg-orange-500/10 p-2.5">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Repair Items</p>
                        <p className="text-2xl font-bold leading-none text-foreground">{totalRepair}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="rounded-lg bg-blue-500/10 p-2.5">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-muted-foreground">Used Items</p>
                        <p className="text-2xl font-bold leading-none text-foreground">{totalUsed}</p>
                    </div>
                </div>
            </div>

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

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-[180px] text-sm">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Categories</SelectItem>
                        {Array.from(new Set<string>((assets || []).map((a: any) => String(a.category_name ?? a.category ?? '').trim()).filter(Boolean))).map((category) => (
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
                        <SelectItem value="all">Types</SelectItem>
                        {Array.from(new Set<string>((assets || []).map((a: any) => String(a.type_name ?? a.type ?? '').trim()).filter(Boolean))).map((type) => (
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
                        {Array.from(new Set<string>((assets || []).map((a: any) => String(a.status ?? a.asset_status ?? '').trim()).filter(Boolean))).map((status) => (
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

                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={exportPdf}>
                                <FileText className="mr-2 h-3.5 w-3.5" /> PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportCsv}>
                                <Download className="mr-2 h-3.5 w-3.5" /> CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <DataTable columns={columns} data={filteredAssets} hideToolbar={!canManageAssets} assetStatuses={canManageAssets ? assetStatuses : []} />

            {/* ── Create Asset Modal ── */}
            <Dialog open={showCreate} onOpenChange={(open) => open ? setShowCreate(true) : closeDialogSafely(() => setShowCreate(false))}>
                <DialogContent className="sm:max-w-2xl">
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <SearchCombo id="create-category" label="Category" value={form.category_id} options={refs.categories} onChange={(val) => handleFormChange('category_id', val)} />
                                <SearchCombo id="create-type" label="Type" value={form.type_id} options={refs.types} onChange={(val) => handleFormChange('type_id', val)} />
                                <SearchCombo id="create-oem" label="OEM" value={form.oem_id} options={refs.oems} onChange={(val) => handleFormChange('oem_id', val)} />
                                <SearchCombo id="create-site" label="Site" required value={form.site_id} options={sites} placeholder="Select site" error={formErrors.site_id} onChange={(val) => handleFormChange('site_id', val)} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {renderField('location', 'Location')}
                                {renderField('purchase_year', 'Purchase Year', false, 'number')}
                                {renderField('serial_number', 'Serial Number')}
                                {renderField('part_number', 'Part Number')}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => closeDialogSafely(() => setShowCreate(false))} disabled={creating}>
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
            <Dialog open={showEdit} onOpenChange={(open) => open ? setShowEdit(true) : closeDialogSafely(() => setShowEdit(false))}>
                <DialogContent className="sm:max-w-2xl">
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <SearchCombo id="edit-category" label="Category" value={editForm.category_id} options={refs.categories} error={editFormErrors.category_id} onChange={(value) => handleEditFormChange('category_id', value)} />
                                <SearchCombo id="edit-type" label="Type" value={editForm.type_id} options={refs.types} error={editFormErrors.type_id} onChange={(value) => handleEditFormChange('type_id', value)} />
                                <SearchCombo id="edit-oem" label="OEM" value={editForm.oem_id} options={refs.oems} error={editFormErrors.oem_id} onChange={(value) => handleEditFormChange('oem_id', value)} />
                                <SearchCombo id="edit-site" label="Site" required value={editForm.site_id} options={sites} placeholder="Select site" error={editFormErrors.site_id} onChange={(value) => handleEditFormChange('site_id', value)} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {renderEditField('location', 'Location')}
                                {renderEditField('purchase_year', 'Purchase Year', false, 'number')}
                                {renderEditField('serial_number', 'Serial Number')}
                                {renderEditField('part_number', 'Part Number')}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => closeDialogSafely(() => setShowEdit(false))} disabled={updating}>Cancel</Button>
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
                                Select available asset to request a loan. Admin will review your request.
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
                                    placeholder="State a reason / purpose"
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
