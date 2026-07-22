import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Key, Plus, Pencil, Trash2, Eye, EyeOff, Search, Upload,
    Package, CheckCircle2, AlertTriangle, Clock, Users, Layers, ChevronDown, Copy,
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    available: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2, label: 'Available' },
    expired: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: AlertTriangle, label: 'Expired' },
    expiring_soon: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', icon: Clock, label: 'Expiring Soon' },
    full: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', icon: Users, label: 'Full' },
};

type ComboOption = { value: string; label: string; color?: string; bg?: string; border?: string };

function SearchCombo({ value, options, placeholder, onChange }: { value: string; options: ComboOption[]; placeholder: string; onChange: (value: string) => void }) {
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
            <Button type="button" variant="outline" className={`h-9 w-full justify-between bg-background font-normal ${selected?.color || ''} ${selected?.bg || ''} ${selected?.border || ''}`} onClick={() => setOpen((current) => !current)}>
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
                            <button key={option.value} type="button" className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${option.color || ''}`} onClick={() => { onChange(option.value); setOpen(false); setQuery(''); }}>
                                <span className="flex items-center gap-2">{option.bg && <span className={`h-2 w-2 rounded-full ${option.bg}`} />}{option.label}</span>
                                {option.value === value && <CheckCircle2 className={`h-4 w-4 ${option.color || 'text-blue-600'}`} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const typeOptions = [
    { value: 'per_user', label: 'Per User' },
    { value: 'per_device', label: 'Per Device' },
    { value: 'concurrent', label: 'Concurrent' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'perpetual', label: 'Perpetual' },
];
const licenseStatusOptions = Object.entries(statusConfig).map(([value, config]) => ({ value, label: config.label, color: config.color, bg: config.bg, border: config.border }));

export default function LicensesIndex({ licenses = [], users = [], assets = [], sites = [], currentSiteId = null }: any) {
    const roles = usePage<any>().props.auth?.user?.roles ?? [];
    const canManageLicenses = roles.includes('Admin') || roles.includes('Manager');
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const [viewLicense, setViewLicense] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
    const [createKeyVisible, setCreateKeyVisible] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [search, setSearch] = useState('');
    const [filterSite, setFilterSite] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importSiteId, setImportSiteId] = useState<string>(currentSiteId ? String(currentSiteId) : '');

    useEffect(() => {
        try {
            if (!Array.isArray(licenses)) {
                setError('Invalid data format received from server');
            } else {
                setError(null);
            }
        } catch (e) {
            console.error('Error processing license data:', e);
            setError('Error processing license data');
        }
    }, [licenses]);

    // ── Categories extracted from data ──
    const categories = useMemo(
        () => [...new Set(licenses.map((l: any) => l.category).filter(Boolean))] as string[],
        [licenses]
    );

    // ── Filtered data ──
    const filteredLicenses = useMemo(() => {
        let filtered = licenses;

        if (filterSite !== 'all') {
            filtered = filtered.filter((l: any) => String(l.site_id) === filterSite);
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter((l: any) => l.category === filterCategory);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter((l: any) => l.status === filterStatus);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter((l: any) =>
                [l.name, l.category, l.type, l.license_key].some(v => String(v ?? '').toLowerCase().includes(q))
            );
        }

        return filtered;
    }, [licenses, filterSite, filterCategory, filterStatus, search]);

    // ── Create Form ──
    const form = useForm({
        name: '',
        category: '',
        type: '',
        total_seat: 1,
        site_id: '',
        license_key: '',
        active_date: '',
        end_date: '',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form.data };

        if (data.total_seat) {
            data.total_seat = Number(data.total_seat);
        }

        if (data.site_id) {
            data.site_id = Number(data.site_id);
        }

        router.post('/licenses', data, {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
                setCreateKeyVisible(false);
                toast.success('License added successfully');
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', ') || 'Failed to create license.');
            }
        });
    };

    // ── Edit Form ──
    const editForm = useForm({
        name: '',
        category: '',
        type: '',
        total_seat: 1,
        site_id: '',
        license_key: '',
        active_date: '',
        end_date: '',
        notes: '',
        status: 'available',
    });

    const openEdit = (license: any) => {
        setSelectedLicense(license);
        editForm.setData({
            name: license.name || '',
            category: license.category || '',
            type: license.type || '',
            total_seat: license.total_seat || 1,
            site_id: license.site_id ? String(license.site_id) : '',
            license_key: license.license_key || '',
            active_date: license.active_date || '',
            end_date: license.end_date || '',
            notes: license.notes || '',
            status: license.status || 'available',
        });
        setIsEditOpen(true);
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedLicense) {
            return;
        }

        const data = { ...editForm.data };

        if (data.total_seat) {
            data.total_seat = Number(data.total_seat);
        }

        if (data.site_id) {
            data.site_id = Number(data.site_id);
        }

        router.put(`/licenses/${selectedLicense.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedLicense(null);
                toast.success('License updated successfully');
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', ') || 'Failed to update license.');
            }
        });
    };

    const handleDelete = () => {
        if (!selectedLicense) {
            return;
        }

        router.delete(`/licenses/${selectedLicense.id}`, {
            data: { delete_reason: deleteReason },
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedLicense(null);
                setDeleteReason('');
                toast.success('License deleted');
            },
            onError: () => toast.error('Failed to delete license'),
        });
    };

    const updateStatus = (license: any, status: string) => {
        router.put(`/licenses/${license.id}`, {
            name: license.name,
            category: license.category,
            type: license.type,
            total_seat: Number(license.total_seat || 1),
            site_id: license.site_id || null,
            license_key: license.license_key || '',
            active_date: license.active_date || '',
            end_date: license.end_date || '',
            notes: license.notes || '',
            status,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('License status updated'),
            onError: () => toast.error('Failed to update status'),
        });
    };

    const handleImport = () => {
        if (!importFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(l => l.trim());

                if (lines.length < 2) {
                    toast.error('CSV must have a header row and at least one data row.');

                    return;
                }

                const headers = lines[0].split(',').map(h => h.trim());
                const licenses = lines.slice(1).map(line => {
                    const vals = line.split(',').map(v => v.trim());
                    const row: Record<string, string> = {};
                    headers.forEach((h, i) => {
                        row[h] = vals[i] ?? '';
                    });

                    return row;
                });
                router.post('/licenses/import-bulk', { licenses, site_id: importSiteId || undefined }, {
                    onSuccess: () => {
                        setIsImportOpen(false);
                        setImportFile(null);
                        setImportSiteId('');
                        toast.success('Import completed successfully');
                    },
                    onError: (err) => {
                        toast.error(Object.values(err).join(', ') || 'Import failed');
                    },
                });
            } catch (err) {
                toast.error('Failed to parse CSV file.');
            }
        };
        reader.readAsText(importFile);
    };

    const toggleKeyVisibility = (id: number) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ── Columns ──
    const columns = [
        {
            accessorKey: 'id',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
        },
        {
            accessorKey: 'name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }: any) => (
                <button onClick={() => {
                    setViewLicense(row.original); setIsViewOpen(true);
                }} className="font-semibold text-primary hover:underline text-left">
                    {row.getValue('name')}
                </button>
            ),
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
        },



        {
            accessorKey: 'site',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
            cell: ({ row }: any) => <span className="text-muted-foreground">{row.getValue('site') || '—'}</span>,
        },
        {
            accessorKey: 'license_key',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Key" />,
            cell: ({ row }: any) => {
                const key = row.getValue('license_key') as string;
                const id = row.original.id;
                const visible = visibleKeys[id];

                return (
                    <div className="flex max-w-[320px] items-center gap-1.5">
                        <span className={`font-mono text-xs ${visible ? 'whitespace-normal break-all' : 'truncate'}`}>
                            {visible ? (key || '—') : (key ? '••••••••' : '—')}
                        </span>
                        {key && (
                            <>
                                <button type="button" onClick={() => toggleKeyVisibility(id)} className="shrink-0 text-muted-foreground hover:text-foreground" title={visible ? 'Hide key' : 'Show key'}>
                                    {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                                {visible && (
                                    <button type="button" onClick={() => navigator.clipboard.writeText(key).then(() => toast.success('License key copied'))} className="shrink-0 text-muted-foreground hover:text-foreground" title="Copy license key">
                                        <Copy className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },

        {
            accessorKey: 'end_date',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="End" />,
            cell: ({ row }: any) => <span className="text-xs">{row.getValue('end_date') || '—'}</span>,
        },
        {
            accessorKey: 'status',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }: any) => {
                const status = row.getValue('status') as string;
                const cfg = statusConfig[status] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Package, label: status || '—' };
                const Icon = cfg.icon;
                const badge = (
                    <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} grid w-[128px] grid-cols-[16px_1fr_16px] items-center gap-1`}>
                        <span className="flex size-4 items-center justify-center"><Icon className="size-3 shrink-0" /></span>
                        <span className="truncate text-center">{cfg.label}</span>
                        <span className="flex size-4 items-center justify-center">{canManageLicenses && <ChevronDown className="size-3 opacity-60" />}</span>
                    </Badge>
                );

                if (!canManageLicenses) return <div className="flex justify-center">{badge}</div>;

                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><button type="button">{badge}</button></DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                {Object.entries(statusConfig).map(([value, option]) => {
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
        ...(canManageLicenses ? [{
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"
                        onClick={() => openEdit(row.original)}
                        aria-label="Edit license"
                        title="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        onClick={() => {
                            setSelectedLicense(row.original); setIsDeleteOpen(true);
                        }}
                        aria-label="Delete license"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        }] : []),
    ];

    // ── Stats ──
    const stats = useMemo(() => {
        const total = filteredLicenses.length;
        const totalSeats = filteredLicenses.reduce((s: number, l: any) => s + (l.total_seat || 0), 0);
        const used = filteredLicenses.reduce((s: number, l: any) => s + (l.used_seat || 0), 0);
        const available = filteredLicenses.filter((l: any) => l.status === 'available').length;
        const expired = filteredLicenses.filter((l: any) => l.status === 'expired').length;
        const expiring = filteredLicenses.filter((l: any) => l.status === 'expiring_soon').length;
        const full = filteredLicenses.filter((l: any) => l.status === 'full').length;

        return { total, totalSeats, used, available, expired, expiring, full };
    }, [filteredLicenses]);

    if (error) {
        return (
            <div className="w-full p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Software Licenses" />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Software Licenses</h1>
                    <p className="text-sm text-muted-foreground">View, manage, and monitor all software licenses</p>
                </div>
                {canManageLicenses && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                            onClick={() => setIsImportOpen(true)}
                        >
                            <Upload className="h-4 w-4" /> Import CSV
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Add License
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Licenses</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                </div>


                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Expiring Soon</p>
                        <p className="text-2xl font-bold">{stats.expiring}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-red-500/10 p-3">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Expired</p>
                        <p className="text-2xl font-bold">{stats.expired}</p>
                    </div>
                </div>

            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[240px]">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm" />
                </div>
                <Select value={filterSite} onValueChange={setFilterSite}>
                    <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue placeholder="Site" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Site</SelectItem>
                        {sites.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Category</SelectItem>
                        {categories.map((c: string) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 w-[130px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
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

            </div>

            {/* Table */}
            <DataTable columns={columns} data={filteredLicenses} hideToolbar={!canManageLicenses} />

            {/* ── License Detail Dialog ── */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="text-xl">{viewLicense?.name}</DialogTitle></DialogHeader>
                    {viewLicense && (
                        <div className="space-y-6">
                            {/* Key + Basic Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">License Key</div>
                                    <div className="font-mono text-xs bg-muted/60 px-2 py-1 rounded border break-all">
                                        {viewLicense.license_key || '—'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</div>
                                    <Badge className={statusConfig[viewLicense.status]?.bg || ''}>{statusConfig[viewLicense.status]?.label || viewLicense.status}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</div>
                                    <div>{viewLicense.category || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Type</div>
                                    <div className="capitalize">{viewLicense.type || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Seats</div>
                                    <div>{viewLicense.used_seat}/{viewLicense.total_seat} used</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Site</div>
                                    <div>{viewLicense.site || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Date</div>
                                    <div>{viewLicense.active_date || '—'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">End Date</div>
                                    <div>{viewLicense.end_date || '—'}</div>
                                </div>
                            </div>

                            {/* Notes */}
                            {viewLicense.notes && (
                                <div className="text-sm border-t pt-3">
                                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Notes</div>
                                    <div className="text-muted-foreground text-xs whitespace-pre-wrap">{viewLicense.notes}</div>
                                </div>
                            )}


                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Import CSV Dialog ── */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Import Licenses from CSV</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Upload a CSV file with columns: name, category, type, total_seat, site_id, license_key, active_date, end_date, status
                        </p>
                        <Input type="file" accept=".csv" onChange={e => setImportFile(e.target.files?.[0] ?? null)} className="h-9" />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Target Site</label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Select site (from CSV if empty)" /></SelectTrigger>
                                <SelectContent>
                                    {sites.map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                        <Button onClick={handleImport} disabled={!importFile}>Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Create Dialog ── */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={handleCreate}>
                        <DialogHeader><DialogTitle>Add New License</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <Input value={form.data.category} onChange={e => form.setData('category', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Type</label>
                                <SearchCombo value={form.data.type} placeholder="Select" options={typeOptions} onChange={v => form.setData('type', v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Allowed Seats *</label>
                                <Input type="number" min={1} value={form.data.total_seat}
                                    onChange={e => form.setData('total_seat', Number(e.target.value))} required className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">License Key</label>
                                <div className="relative">
                                    <Input type={createKeyVisible ? 'text' : 'password'} value={form.data.license_key}
                                        onChange={e => form.setData('license_key', e.target.value)} className="h-9 pr-8" />
                                    <button type="button" onClick={() => setCreateKeyVisible(!createKeyVisible)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {createKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Site</label>
                                <SearchCombo value={form.data.site_id} placeholder="Select" options={sites.map((s: any) => ({ value: String(s.id), label: s.name }))} onChange={v => form.setData('site_id', v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Active Date</label>
                                <Input type="date" value={form.data.active_date}
                                    onChange={e => form.setData('active_date', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={form.data.end_date}
                                    onChange={e => form.setData('end_date', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Duration (months)</label>
                                <Input type="number" min={1} value={form.data.duration_months}
                                    onChange={e => form.setData('duration_months', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} rows={2} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit">Create License</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <form onSubmit={handleEdit}>
                        <DialogHeader><DialogTitle>Edit License</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <Input value={editForm.data.category} onChange={e => editForm.setData('category', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Type</label>
                                <SearchCombo value={editForm.data.type} placeholder="Select" options={typeOptions} onChange={v => editForm.setData('type', v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Allowed Seats *</label>
                                <Input type="number" min={1} value={editForm.data.total_seat}
                                    onChange={e => editForm.setData('total_seat', Number(e.target.value))} required className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">License Key</label>
                                <Input value={editForm.data.license_key} onChange={e => editForm.setData('license_key', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Site</label>
                                <SearchCombo value={editForm.data.site_id} placeholder="Select" options={sites.map((s: any) => ({ value: String(s.id), label: s.name }))} onChange={v => editForm.setData('site_id', v)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Active Date</label>
                                <Input type="date" value={editForm.data.active_date} onChange={e => editForm.setData('active_date', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={editForm.data.end_date} onChange={e => editForm.setData('end_date', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Duration (months)</label>
                                <Input type="number" min={1} value={editForm.data.duration_months} onChange={e => editForm.setData('duration_months', e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Status</label>
                                <SearchCombo value={editForm.data.status} placeholder="Select status" options={licenseStatusOptions} onChange={v => editForm.setData('status', v)} />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea value={editForm.data.notes} onChange={e => editForm.setData('notes', e.target.value)} rows={2} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit">Update License</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete License</DialogTitle></DialogHeader>
                    {selectedLicense && (
                        <div className="py-4 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete <strong>{selectedLicense.name}</strong>?
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Reason (optional)</label>
                                <Textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} placeholder="Enter reason for deletion..." rows={2} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
