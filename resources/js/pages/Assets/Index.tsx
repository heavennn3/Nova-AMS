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
import { Textarea } from '@/components/ui/textarea';

export default function AssetIndex({
    assets = [],
    configurations = [],
}: {
    assets: any[];
    configurations?: any[];
}) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(
        null,
    );
    const [search, setSearch] = useState('');

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

                // Date → format nicely
                if (cfg.data_type === 'date' && val) {
                    return <span className="text-muted-foreground text-sm">{val}</span>;
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
        setImportSiteId(selectedSiteId);
    };

    const confirmImport = () => {
        if (!pendingImportData) return;

        router.post('/assets/import-bulk', { assets: pendingImportData }, {
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

    const filteredAssets = assets || [];

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
                const configKeys = configurations?.map((c: any) => c.column_key) || [];
                const q = search.toLowerCase();
                const filteredAssets = (assets || []).filter((a) => {
                    if (!q) return true;
                    return configKeys.some((key: string) => {
                        const v = a[key];
                        return v && String(v).toLowerCase().includes(q);
                    });
                });

                return (
                    <>
                        {/* Search + Filter row */}
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
                            Are you sure you want to import{' '}
                            {pendingImportData?.length} assets?
                        </DialogDescription>
                    </DialogHeader>

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
