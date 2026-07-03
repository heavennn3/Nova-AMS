import * as React from 'react';
import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Edit,
    Trash2,
    Wrench,
    Package,
    Search,
    Eye,
    Copy,
    Printer,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
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
    configurations = [],
    sites = [],
}: {
    assets: any[];
    configurations?: any[];
    sites?: { id: string; name: string }[];
}) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(
        null,
    );
    const [importSiteId, setImportSiteId] = useState<string>('');
    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState<string>('all');

    const columns = React.useMemo(() => {
        const cols: any[] = (configurations || []).map((cfg: any) => ({
            accessorKey: cfg.column_key,
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title={cfg.column_title} />
            ),
            enableSorting: cfg.is_sortable,
            cell: ({ row }: any) => {
                const val = row.getValue(cfg.column_key);

                // Primary key → link to show page
                if (cfg.is_primary_key) {
                    return (
                        <Link
                            href={`/assets/${row.original.id}`}
                            className="text-emerald-600 hover:underline font-mono font-medium text-sm"
                        >
                            {val}
                        </Link>
                    );
                }

                // Number → right-aligned
                if (cfg.data_type === 'number') {
                    return <div className="text-right font-medium tabular-nums">{val}</div>;
                }

                return <span className="text-muted-foreground text-sm font-medium">{val ?? '—'}</span>;
            },
        }));

        // Actions column
        if (isAdmin) {
            cols.push({
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

        return cols;
    }, [configurations, isAdmin]);

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

        const assetName = configurations?.find((c: any) => c.is_primary_key)?.column_title || 'Asset';

        return (
            <form onSubmit={submit} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Request Maintenance</DialogTitle>
                    <DialogDescription>
                        Create a work order for this {assetName.toLowerCase()}.
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
    };

    const confirmImport = () => {
        if (!pendingImportData) return;

        const selectedSite = sites.find((s) => String(s.id) === importSiteId);
        const siteName = selectedSite?.name || '';

        router.post(
            '/assets/import-bulk',
            { assets: pendingImportData, site_name: siteName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    alert(
                        `Successfully imported ${pendingImportData.length} assets from CSV!`,
                    );
                    setPendingImportData(null);
                    setImportSiteId('');
                },
                onError: (err) => {
                    console.error('Import failed:', err);
                    alert('Failed to import CSV. Check console for details.');
                    setPendingImportData(null);
                },
            },
        );
    };

    // Filter by site
    const configKeys = configurations?.map((c: any) => c.column_key) || [];
    const hasLokasiKey = configKeys.includes('lokasi');
    const filteredAssets = (assets || []).filter((a: any) => {
        if (siteFilter === 'all') return true;
        const lokasi = (a.lokasi || '').toLowerCase();
        const site = sites.find((s) => String(s.id) === siteFilter);
        return site && lokasi.includes(site.name.toLowerCase());
    });

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
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Wrench className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Assets
                        </p>
                        <p className="text-2xl font-bold">
                            {(assets || []).length}
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
                        Manage IT assets and equipment
                    </p>
                </div>
                <div className="flex space-x-3">
                    {isAdmin && (
                        <>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => router.get('/assets/create')}
                            >
                                <Plus className="mr-2 h-4 w-4" /> New Asset
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {(() => {
                const q = search.toLowerCase();
                const searchedAssets = filteredAssets.filter((a: any) => {
                    if (!q) return true;
                    return configKeys.some((key: string) => {
                        const v = a[key];
                        return v && String(v).toLowerCase().includes(q);
                    });
                });

                return (
                    <>
                        {/* Search + Site Filter + Import row */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-[280px]">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search "
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-8 pl-8 text-sm"
                                />
                            </div>

                            {/* Site filter dropdown */}
                            {sites.length > 0 && hasLokasiKey && (
                                <Select value={siteFilter} onValueChange={setSiteFilter}>
                                    <SelectTrigger className="h-8 w-[200px] text-sm">
                                        <SelectValue placeholder="All Sites" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sites</SelectItem>
                                        {sites.map((site) => (
                                            <SelectItem key={site.id} value={String(site.id)}>
                                                {site.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <DataTableActions
                                data={searchedAssets}
                                columns={columns}
                                exportFileName="asset_inventory_export"
                                onImportCsv={handleImportCsv}
                            />
                        </div>

                        <DataTable
                            columns={columns}
                            data={searchedAssets}
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
                            {pendingImportData?.length} assets detected.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Site selection for import */}
                    {sites.length > 0 && (
                        <div className="space-y-2 py-2">
                            <Label htmlFor="import-site">Assign to Site (optional)</Label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger id="import-site">
                                    <SelectValue placeholder="No site (use CSV Lokasi column)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No site (use CSV data)</SelectItem>
                                    {sites.map((site) => (
                                        <SelectItem key={site.id} value={String(site.id)}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                If the CSV already has a "Lokasi" column, the site won't override it.
                            </p>
                        </div>
                    )}

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
