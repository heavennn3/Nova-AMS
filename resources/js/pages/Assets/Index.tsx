import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RegistrationChoiceModal from '@/components/scanner/registration-choice-modal';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Plus,
    Edit,
    Trash2,
    Wrench,
    FileText,
    Package,
    CheckCircle2,
    Search,
    Filter,
    X,
    Check,
    Info,
    User,
    Calendar,
    MessageSquare,
    TrendingDown,
    Eye,
    Copy,
    Printer,
    Upload,
    Download,
    ScanLine,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AssetIndex({
    assets = [],
    sites = [],
}: {
    assets: any[];
    sites?: any[];
}) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;
    const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
        return sites && sites.length > 0 ? sites[0]?.id?.toString() || '' : '';
    });
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(
        null,
    );
    const [importSiteId, setImportSiteId] = useState<string>('');
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [choiceModalOpen, setChoiceModalOpen] = useState(false);

    const handleRegistrationChoice = (choice: 'manual' | 'scan' | 'upload') => {
        switch (choice) {
            case 'manual':
                router.get(`/assets/create?site_id=${selectedSiteId}`);
                break;
            case 'scan':
                router.get(`/assets/scan?site_id=${selectedSiteId}`);
                break;
            case 'upload':
                router.get(`/assets/upload?site_id=${selectedSiteId}`);
                break;
        }
        setChoiceModalOpen(false);
    };

    const columns = React.useMemo(() => {
        const baseColumns = [
            {
                accessorKey: 'asset_id',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Asset Tag" />
                ),
                cell: ({ row }: any) => (
                    <Link
                        href={`/assets/${row.original.id}`}
                        className="text-emerald-600 hover:underline font-mono font-medium text-sm"
                    >
                        {row.getValue('asset_id')}
                    </Link>
                ),
            },
            {
                id: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Name" />
                ),
                cell: ({ row }: any) => (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                                {row.original.product_name || row.original.asset_name || 'Unnamed Asset'}
                            </span>
                            {row.original.quantity > 1 && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                                    Batch ×{row.original.quantity} pcs
                                </span>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'type',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Asset Type" />
                ),
                cell: ({ row }: any) => (
                    <span className="text-muted-foreground text-sm font-medium">
                        {row.original.type || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'category',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Category" />
                ),
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                        {row.original.category || '—'}
                    </div>
                ),
            },
            {
                accessorKey: 'status',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }: any) => {
                    const status = row.original.status;
                    const statusColors: Record<string, string> = {
                        available: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400',
                        in_use: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400',
                        maintenance: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/30 dark:bg-yellow-900/10 dark:text-yellow-400',
                        faulty: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400',
                        degraded: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400',
                        new: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400',
                        retired: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800/50 dark:bg-slate-800/10 dark:text-slate-400',
                    };

                    const labels: Record<string, string> = {
                        available: 'Available',
                        in_use: 'Assigned',
                        maintenance: 'Maintenance',
                        faulty: 'Faulty',
                        degraded: 'Degraded',
                        new: 'New',
                        retired: 'Retired',
                    };

                    const colorClass = statusColors[status] || 'border-secondary bg-secondary/50 text-secondary-foreground';

                    return (
                        <div className="flex items-center gap-1.5">
                            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide ${colorClass}`}>
                                {labels[status] || status || 'Unknown'}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'condition',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Condition" />
                ),
                cell: ({ row }: any) => {
                    const condition = row.original.condition_status || 'good';
                    const colorClass = condition.toLowerCase() === 'good'
                        ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400'
                        : 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400';
                    return (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-wide ${colorClass}`}>
                            {condition}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'vendor',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Vendor" />
                ),
                cell: ({ row }: any) => (
                    <span className="text-muted-foreground text-sm font-medium">
                        {row.original.vendor || '—'}
                    </span>
                ),
            },
        ];

        if (isAdmin) {
            baseColumns.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => {
                    const asset = row.original;
                    return (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                            <Link href={`/assets/${asset.id}`} className="p-1.5 hover:text-primary transition-colors" title="View">
                                <Eye className="h-4 w-4" />
                            </Link>
                            <Link href={`/assets/${asset.id}/edit`} className="p-1.5 hover:text-blue-600 transition-colors" title="Edit">
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button className="p-1.5 hover:text-amber-600 transition-colors" title="Duplicate">
                                <Copy className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 hover:text-slate-800 transition-colors" title="Print Label">
                                <Printer className="h-4 w-4" />
                            </button>
                            <button
                                className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this asset?')) {
                                        router.delete(`/assets/${asset.id}`);
                                    }
                                }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                },
            });
        }

        return baseColumns;
    }, [isAdmin]);

    function MaintenanceRequestForm({ asset }: { asset: any }) {
        const { data, setData, post, processing, reset } = useForm({
            asset_id: asset.id,
            issue: '',
            priority: 'medium',
        });

        const submit = (e: React.FormEvent) => {
            e.preventDefault();
            post('/maintenance/work-orders', {
                onSuccess: () => {
                    alert('Maintenance requested successfully!');
                    reset();
                },
            });
        };

        return (
            <form onSubmit={submit} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Request Maintenance</DialogTitle>
                    <DialogDescription>
                        Create a work order for {asset.product_name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label>Issue Description</Label>
                    <Textarea
                        placeholder="What needs to be fixed?"
                        value={data.issue}
                        onChange={(e) => setData('issue', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                        value={data.priority}
                        onValueChange={(val) => setData('priority', val)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        Submit Request
                    </Button>
                </DialogFooter>
            </form>
        );
    }

    const handleImportCsv = (importedData: any[]) => {
        setPendingImportData(importedData);
        setImportSiteId(selectedSiteId);
    };

    const confirmImport = () => {
        if (!pendingImportData || !importSiteId) return;

        const payload: any = {
            assets: pendingImportData,
            site_id: importSiteId,
        };

        router.post('/assets/import-bulk', payload, {
            preserveScroll: true,
            onSuccess: () => {
                alert(
                    `Successfully imported ${pendingImportData.length} assets from CSV!`,
                );
                setPendingImportData(null);
            },
            onError: (err) => {
                console.error('Import failed:', err);
                alert('Failed to import CSV. Check console for details.');
                setPendingImportData(null);
            },
        });
    };

    const filteredAssets = (assets || []).filter(
        (a) => a?.site_id?.toString() === selectedSiteId,
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-primary/10 p-3">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Assets Registered
                        </p>
                        <p className="text-2xl font-bold">
                            {(assets || []).length}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-emerald-500/10 p-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            In Current Site
                        </p>
                        <p className="text-2xl font-bold">
                            {
                                (assets || []).filter(
                                    (a: any) =>
                                        a?.site_id?.toString() ===
                                        selectedSiteId,
                                ).length
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Wrench className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Sites Managed
                        </p>
                        <p className="text-2xl font-bold">
                            {sites?.length || 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Assets
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your IT assets and equipment
                    </p>
                </div>
                <div className="flex space-x-3">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            className="text-muted-foreground shadow-sm"
                            onClick={() => router.get(`/assets/upload?site_id=${selectedSiteId}`)}
                        >
                            <Upload className="mr-2 h-4 w-4" /> Import
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="text-muted-foreground shadow-sm"
                        onClick={() => {
                            const headers = [
                                'Asset ID',
                                'Product Name',
                                'Category',
                                'Site',
                                'Status',
                                'Quantity',
                                'Purchase Year',
                                'Vendor',
                            ];
                            const rows = filteredAssets.map((a) => [
                                a.asset_id,
                                a.product_name,
                                a.category,
                                a.site,
                                a.status,
                                a.quantity,
                                a.purchase_year,
                                a.vendor,
                            ]);
                            const csvContent =
                                'data:text/csv;charset=utf-8,' +
                                [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute('download', 'asset_inventory.csv');
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    {isAdmin && (
                        <>
                            <Button
                                variant="outline"
                                className="text-muted-foreground shadow-sm"
                                onClick={() => router.get(`/assets/scan?site_id=${selectedSiteId}`)}
                            >
                                <ScanLine className="mr-2 h-4 w-4" /> Scan QR
                            </Button>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => router.get(`/assets/create?site_id=${selectedSiteId}`)}
                            >
                                <Plus className="mr-2 h-4 w-4" /> New Asset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="no-scrollbar flex w-full space-x-2 overflow-x-auto border-b border-border pb-px">
                {sites?.map((site: any) => {
                    const count = (assets || []).filter(
                        (a: any) => a?.site_id === site.id,
                    ).length;
                    return (
                        <button
                            key={site.id || Math.random()}
                            onClick={() =>
                                setSelectedSiteId(site.id?.toString() || '')
                            }
                            className={`flex items-center space-x-2 border-b-2 px-4 py-2 whitespace-nowrap transition-all ${selectedSiteId === (site.id?.toString() || '')
                                    ? 'border-primary bg-primary/5 font-bold text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                }`}
                        >
                            <span>{site.name}</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] ${selectedSiteId ===
                                        (site.id?.toString() || '')
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {(() => {
                const siteFilteredAssets = (assets || []).filter(
                    (a) => a?.site_id?.toString() === selectedSiteId,
                );
                const allStatuses = [
                    ...new Set(
                        siteFilteredAssets.map((a) => a.status).filter(Boolean),
                    ),
                ].sort() as string[];
                const allVendors = [
                    ...new Set(
                        siteFilteredAssets.map((a) => a.vendor).filter(Boolean),
                    ),
                ].sort() as string[];
                const allCategories = [
                    ...new Set(
                        siteFilteredAssets.map((a) => a.category).filter(Boolean),
                    ),
                ].sort() as string[];
                const activeFilterCount =
                    (selectedStatus !== 'all' ? 1 : 0) +
                    (selectedVendor !== 'all' ? 1 : 0) +
                    (selectedCategory !== 'all' ? 1 : 0);
                const filteredAssets = siteFilteredAssets.filter((a) => {
                    const matchesStatus =
                        selectedStatus === 'all' || a.status === selectedStatus;
                    const matchesVendor =
                        selectedVendor === 'all' || a.vendor === selectedVendor;
                    const matchesCategory =
                        selectedCategory === 'all' || a.category === selectedCategory;
                    const q = search.toLowerCase();
                    const matchesSearch =
                        !q ||
                        (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                        (a.product_name &&
                            a.product_name.toLowerCase().includes(q)) ||
                        (a.vendor && a.vendor.toLowerCase().includes(q)) ||
                        (a.category && a.category.toLowerCase().includes(q));
                    return matchesStatus && matchesVendor && matchesCategory && matchesSearch;
                });

                return (
                    <>
                        {/* Search + Filter row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-[280px]">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, tag, serial..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-sm"
                                />
                            </div>
                            {/* Status Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 gap-1.5 border-dashed ${selectedStatus !== 'all' ? 'border-green-300 bg-green-50 text-green-700' : ''}`}
                                    >
                                        Status
                                        {selectedStatus !== 'all' && (
                                            <span className="ml-0.5 text-xs font-normal">: {selectedStatus}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[220px] p-0" align="start">
                                    <div className="border-b p-2.5">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto p-1">
                                        <button
                                            onClick={() => setSelectedStatus('all')}
                                            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${selectedStatus === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All</span>
                                            {selectedStatus === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </button>
                                        {allStatuses.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedStatus(s)}
                                                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm capitalize transition-colors hover:bg-muted ${selectedStatus === s ? 'font-medium' : ''}`}
                                            >
                                                <span>{s}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {siteFilteredAssets.filter((a) => a.status === s).length}
                                                    </span>
                                                    {selectedStatus === s && <Check className="h-3.5 w-3.5 text-primary" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Vendor Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 gap-1.5 border-dashed ${selectedVendor !== 'all' ? 'border-blue-300 bg-blue-50 text-blue-700' : ''}`}
                                    >
                                        Vendor
                                        {selectedVendor !== 'all' && (
                                            <span className="ml-0.5 text-xs font-normal">: {selectedVendor}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[220px] p-0" align="start">
                                    <div className="border-b p-2.5">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</p>
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto p-1">
                                        <button
                                            onClick={() => setSelectedVendor('all')}
                                            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${selectedVendor === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All</span>
                                            {selectedVendor === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </button>
                                        {allVendors.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setSelectedVendor(v)}
                                                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${selectedVendor === v ? 'font-medium' : ''}`}
                                            >
                                                <span>{v}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {siteFilteredAssets.filter((a) => a.vendor === v).length}
                                                    </span>
                                                    {selectedVendor === v && <Check className="h-3.5 w-3.5 text-primary" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Category Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-8 gap-1.5 border-dashed ${selectedCategory !== 'all' ? 'border-violet-300 bg-violet-50 text-violet-700' : ''}`}
                                    >
                                        Category
                                        {selectedCategory !== 'all' && (
                                            <span className="ml-0.5 text-xs font-normal">: {selectedCategory}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[220px] p-0" align="start">
                                    <div className="border-b p-2.5">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</p>
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto p-1">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${selectedCategory === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All</span>
                                            {selectedCategory === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </button>
                                        {allCategories.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setSelectedCategory(c)}
                                                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${selectedCategory === c ? 'font-medium' : ''}`}
                                            >
                                                <span>{c}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {siteFilteredAssets.filter((a) => a.category === c).length}
                                                    </span>
                                                    {selectedCategory === c && <Check className="h-3.5 w-3.5 text-primary" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Clear all */}
                            {activeFilterCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-muted-foreground"
                                    onClick={() => {
                                        setSelectedStatus('all');
                                        setSelectedVendor('all');
                                        setSelectedCategory('all');
                                    }}
                                >
                                    <X className="mr-1 h-3 w-3" /> Clear
                                </Button>
                            )}

                            <DataTableActions
                                data={filteredAssets}
                                columns={columns}
                                exportFileName="asset_inventory_export"
                                onImportCsv={handleImportCsv}
                            />
                            {selectedStatus !== 'all' && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                    Status: {selectedStatus}
                                    <button onClick={() => setSelectedStatus('all')} className="ml-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedVendor !== 'all' && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                    Vendor: {selectedVendor}
                                    <button onClick={() => setSelectedVendor('all')} className="ml-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedCategory !== 'all' && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-violet-100 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                                    Category: {selectedCategory}
                                    <button onClick={() => setSelectedCategory('all')} className="ml-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {activeFilterCount > 0 && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                    {filteredAssets.length} of{' '}
                                    {siteFilteredAssets.length} assets
                                </span>
                            )}
                        </div>

                        <DataTable
                            columns={columns}
                            data={filteredAssets}
                            onImportCsv={handleImportCsv}
                            hideToolbar
                        />
                    </>
                );
            })()}

            <Dialog
                open={!!pendingImportData}
                onOpenChange={(open) => !open && setPendingImportData(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import CSV</DialogTitle>
                        <DialogDescription>
                            Select the location for the{' '}
                            {pendingImportData?.length} assets you are
                            importing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="mb-2 block text-sm font-medium">
                            Location
                        </label>
                        <Select
                            value={importSiteId}
                            onValueChange={setImportSiteId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                {sites?.map((site: any) => (
                                    <SelectItem
                                        key={site.id || Math.random()}
                                        value={site.id?.toString() || ''}
                                    >
                                        {site.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingImportData(null)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmImport}>Confirm Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Registration Choice Modal */}
            <RegistrationChoiceModal
                open={choiceModalOpen}
                onClose={() => setChoiceModalOpen(false)}
                onSelect={handleRegistrationChoice}
            />
        </div>
    );
}
AssetIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asset Inventory',
            href: '#',
        },
    ],
};
