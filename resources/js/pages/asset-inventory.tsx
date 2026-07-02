import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Edit, Trash2, Search, Filter, X, Check } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface Configuration {
    id: number;
    column_key: string;
    column_title: string;
    data_type: string;
    data_source: string | null;
    is_primary_key: boolean;
    is_sortable: boolean;
    is_filterable: boolean;
    is_visible: boolean;
    sort_order: number;
    alignment: string;
    format_pattern: string | null;
    options: any;
}

interface Asset {
    id: number;
    asset_id: string;
    category: string;
    type: string;
    site: string;
    site_id: number | null;
    quantity: number;
    vendor: string;
    product_name: string;
    purchase_year: string;
    status: string;
    condition_status: string;
    assignment: any;
}

interface AssetIndexProps {
    assets: Asset[];
    configurations: Configuration[];
}

const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    faulty: 'bg-red-100 text-red-800',
    degraded: 'bg-orange-100 text-orange-800',
    new: 'bg-emerald-100 text-emerald-800',
    retired: 'bg-slate-100 text-slate-800',
};

const statusLabels: Record<string, string> = {
    available: 'Available',
    in_use: 'In Use',
    maintenance: 'Maintenance',
    faulty: 'Faulty Unit',
    degraded: 'Degraded Unit',
    new: 'New Unit',
    retired: 'Retired',
};

export default function AssetIndex({ assets, configurations }: AssetIndexProps) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState('all');

    const allStatuses = useMemo(
        () =>
            [...new Set((assets || []).map((a) => a.status).filter(Boolean))].sort(),
        [assets],
    );
    const allVendors = useMemo(
        () =>
            [...new Set((assets || []).map((a) => a.vendor).filter(Boolean))].sort(),
        [assets],
    );

    const filteredAssets = useMemo(() => {
        return (assets || []).filter((a) => {
            const matchesStatus =
                selectedStatus === 'all' || a.status === selectedStatus;
            const matchesVendor =
                selectedVendor === 'all' || a.vendor === selectedVendor;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                (a.product_name && a.product_name.toLowerCase().includes(q)) ||
                (a.vendor && a.vendor.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q)) ||
                (a.site && a.site.toLowerCase().includes(q));
            return matchesStatus && matchesVendor && matchesSearch;
        });
    }, [assets, search, selectedStatus, selectedVendor]);

    const activeFilterCount =
        (selectedStatus !== 'all' ? 1 : 0) + (selectedVendor !== 'all' ? 1 : 0);

    const columns = useMemo(() => {
        const cols: ColumnDef<Asset>[] = (configurations || []).map((cfg) => ({
            accessorKey: cfg.column_key,
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title={cfg.column_title} />
            ),
            headerText: cfg.column_title,
            enableSorting: cfg.is_sortable,
            cell: ({ row }: any) => {
                const val = row.getValue(cfg.column_key);

                // Asset ID → link
                if (cfg.column_key === 'asset_id') {
                    return (
                        <Link
                            href={`/assets/${row.original.id}`}
                            className="text-primary hover:underline font-mono font-semibold"
                        >
                            {val}
                        </Link>
                    );
                }

                // Status → colored badge
                if (cfg.column_key === 'status') {
                    const colorClass =
                        statusColors[val] || 'bg-secondary text-secondary-foreground';
                    return (
                        <div className="flex items-center">
                            <span
                                className={`rounded px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${colorClass}`}
                            >
                                {statusLabels[val] || val || 'Unknown'}
                            </span>
                        </div>
                    );
                }

                // Number → right-aligned
                if (cfg.data_type === 'number') {
                    return <div className="text-right font-medium">{val}</div>;
                }

                // Boolean → checkmark
                if (cfg.data_type === 'boolean') {
                    return val ? '✓' : '—';
                }

                // Everything else → plain text
                return <span>{val ?? '—'}</span>;
            },
        }));

        // Actions column (always present, not configurable)
        cols.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const asset = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Link href={`/assets/${asset.id}/edit`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-blue-600"
                            >
                                <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this asset?')) {
                                    router.delete(`/assets/${asset.id}`);
                                }
                            }}
                        >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                    </div>
                );
            },
        });

        return cols;
    }, [configurations]);

    const handleImportCsv = (importedData: any[]) => {
        router.post(
            '/assets/import-bulk',
            { assets: importedData },
            {
                preserveScroll: true,
                onSuccess: () =>
                    alert(`Successfully imported ${importedData.length} assets from CSV!`),
                onError: (err) => {
                    console.error('Import failed:', err);
                    alert('Failed to import CSV. Check console for details.');
                },
            },
        );
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Asset Register
                    </h1>
                    <p className="mt-1 text-muted-foreground"></p>
                </div>
                <Link href="/assets/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Asset
                    </Button>
                </Link>
            </div>

            {/* Search + Filter row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[280px]">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search asset ID, product, vendor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-dashed"
                        >
                            <Filter className="h-3.5 w-3.5" /> Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[260px] p-0" align="start">
                        <div className="border-b p-3">
                            <p className="text-sm font-semibold">Filter Assets</p>
                        </div>
                        <div className="border-b p-3">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Status</p>
                            <div className="max-h-[150px] space-y-0.5 overflow-y-auto">
                                <button
                                    onClick={() => setSelectedStatus('all')}
                                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedStatus === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All</span>
                                    {selectedStatus === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allStatuses.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedStatus(s)}
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm capitalize transition-colors hover:bg-muted ${selectedStatus === s ? 'font-medium' : ''}`}
                                    >
                                        <span>{s}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {(assets || []).filter((a) => a.status === s).length}
                                            </span>
                                            {selectedStatus === s && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="border-b p-3">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Vendor</p>
                            <div className="max-h-[150px] space-y-0.5 overflow-y-auto">
                                <button
                                    onClick={() => setSelectedVendor('all')}
                                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedVendor === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All</span>
                                    {selectedVendor === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allVendors.map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setSelectedVendor(v)}
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedVendor === v ? 'font-medium' : ''}`}
                                    >
                                        <span>{v}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {(assets || []).filter((a) => a.vendor === v).length}
                                            </span>
                                            {selectedVendor === v && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {activeFilterCount > 0 && (
                            <div className="p-2">
                                <Button variant="ghost" size="sm" className="h-8 w-full text-xs" onClick={() => { setSelectedStatus('all'); setSelectedVendor('all'); }}>
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
                {selectedStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-green-100 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Status: {selectedStatus}
                        <button onClick={() => setSelectedStatus('all')} className="ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                )}
                {selectedVendor !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        Vendor: {selectedVendor}
                        <button onClick={() => setSelectedVendor('all')} className="ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                )}
                {activeFilterCount > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                        {filteredAssets.length} of {(assets || []).length} assets
                    </span>
                )}
                </div>
                <DataTableActions
                    data={filteredAssets}
                    columns={columns}
                    exportFileName="asset_inventory_export"
                    onImportCsv={handleImportCsv}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredAssets}
                hideToolbar
            />
        </div>
    );
}

AssetIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asset Inventory',
            href: '/asset-inventory',
        },
    ],
};
