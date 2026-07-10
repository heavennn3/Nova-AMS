import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Search,
    Upload,
    MapPin,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function AssetIndex({
    assets = [],
    sites = [],
    totalSites = 0,
    totalFaulty = 0,
    totalRecentAdded = 0,
    currentSiteId = null,
    assetStatuses = [],
}: {
    assets: any[];
    sites?: { id: string; name: string }[];
    totalSites?: number;
    totalFaulty?: number;
    totalRecentAdded?: number;
    currentSiteId?: number | null;
    assetStatuses?: { id: number; name: string; color: string }[];
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleImportCsv = (data: any[]) => confirmImport(data);

    const confirmImport = (importedData: any[]) => {
        if (!importedData || importedData.length === 0) {
            toast.error('CSV file is empty.');
            return;
        }

        router.post(
            '/assets/import-bulk',
            { assets: importedData, site_id: currentSiteId },
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

    // ── Columns ──
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
                    <Link
                        href={`/assets/${row.original.id}`}
                        className="text-emerald-600 hover:underline font-mono font-medium text-sm"
                    >
                        {row.getValue('asset_id') ?? '—'}
                    </Link>
                ),
            },
            {
                accessorKey: 'asset_name',
                header: 'Asset Name',
                cell: ({ row }: any) => (
                    <span className="text-muted-foreground text-sm font-medium">
                        {row.getValue('asset_name') ?? '—'}
                    </span>
                ),
            },
            { accessorKey: 'category', header: 'Category' },
            { accessorKey: 'type', header: 'Type' },
            { accessorKey: 'location', header: 'Location' },
            { accessorKey: 'oem', header: 'OEM' },
            {
                accessorKey: 'purchase_year',
                header: 'Purchase Year',
                cell: ({ row }: any) => (
                    <div className="text-right font-medium tabular-nums">
                        {row.getValue('purchase_year') ?? '—'}
                    </div>
                ),
            },
            { accessorKey: 'serial_number', header: 'Serial No.' },
            { accessorKey: 'part_number', header: 'Part No.' },
            {
                id: 'status',
                accessorKey: 'status',
                filterFn: (row: any, id: string, filterValue: string[]) =>
                    filterValue.includes(row.getValue(id)),
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
                cell: ({ row }: any) => {
                    const asset = row.original;
                    return (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                            <Link
                                href={`/assets/${asset.id}/edit`}
                                className="p-1.5 hover:text-blue-600 transition-colors"
                                title="Edit"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
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
            },
        ];

        return cols;
    }, [assetStatuses]);

    const filteredAssets = React.useMemo(() => {
        let result = assets || [];
        if (statusFilter !== 'all') {
            result = result.filter((a: any) => a.status === statusFilter);
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
    }, [assets, search, statusFilter]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-primary/10 p-3">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-2xl font-bold">{(assets || []).length}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-emerald-500/10 p-3">
                        <MapPin className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sites</p>
                        <p className="text-2xl font-bold">{totalSites ?? 0}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-red-500/10 p-3">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Faulty</p>
                        <p className="text-2xl font-bold">{totalFaulty ?? 0}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Plus className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Recently Added</p>
                        <p className="text-2xl font-bold">{totalRecentAdded ?? 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
                    <p className="text-sm text-muted-foreground">Manage IT assets and equipment</p>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => router.get('/assets/create')}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Asset
                </Button>
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

                {sites.length > 0 && (
                    <Select
                        value={currentSiteId ? String(currentSiteId) : ''}
                        onValueChange={(v) => router.get('/assets', { site_id: v })}
                    >
                        <SelectTrigger className="h-8 w-[200px] text-sm">
                            <SelectValue
                                placeholder={
                                    sites.find((s) => String(s.id) === String(currentSiteId))?.name ||
                                    'Select site'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {sites.map((site) => (
                                <SelectItem key={site.id} value={String(site.id)}>
                                    {site.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[150px] text-sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {assetStatuses.map((s: any) => (
                            <SelectItem key={s.id} value={s.name}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DataTableActions
                    data={filteredAssets}
                    columns={columns}
                    exportFileName="asset_inventory_export"
                    onImportCsv={handleImportCsv}
                />

                <Button variant="outline" size="sm" onClick={openFilePicker}>
                    <Upload className="mr-2 h-4 w-4" /> Import CSV
                </Button>
            </div>

            <DataTable columns={columns} data={filteredAssets} hideToolbar assetStatuses={assetStatuses} />
        </div>
    );
}

AssetIndex.layout = {
    breadcrumbs: [{ title: 'Asset Inventory', href: '#' }],
};
