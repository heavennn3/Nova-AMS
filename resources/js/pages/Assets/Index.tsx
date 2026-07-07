import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    Plus,
    Edit,
    Trash2,
    Package,
    Search,
    Eye,
    Copy,
    Printer,
    Upload,
    Table2,
    MapPin,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import Papa from 'papaparse';

export default function AssetIndex({
    assets = [],
    configurations = [],
    sites = [],
    totalSites = 0,
    totalFaulty = 0,
    totalRecentAdded = 0,
    configuredSiteIds = [],
    currentSiteId = null,
    assetStatuses = [],
}: {
    assets: any[];
    configurations?: any[];
    sites?: { id: string; name: string }[];
    totalSites?: number;
    totalFaulty?: number;
    totalRecentAdded?: number;
    configuredSiteIds?: number[];
    currentSiteId?: number | null;
    assetStatuses?: { id: number; name: string; color: string }[];
}) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
    const [importSiteId, setImportSiteId] = useState<string>(currentSiteId ? String(currentSiteId) : '');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [titleMap, setTitleMap] = useState<Record<number, string>>({});
    const currentSiteHasConfig = currentSiteId
        ? configuredSiteIds.includes(currentSiteId) || configurations.some((c: any) => !c.site_id)
        : false;

    const handleTitleChange = (configId: number, newTitle: string) => {
        setTitleMap((prev) => ({ ...prev, [configId]: newTitle }));
    };

    // ── No-config flow: detect CSV headers → pick PK → create configs ──
    const [csvConfigOpen, setCsvConfigOpen] = useState(false);
    const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
    const [primaryKeyHeader, setPrimaryKeyHeader] = useState<string>('');
    const [csvRawData, setCsvRawData] = useState<any[] | null>(null);
    const [configuring, setConfiguring] = useState(false);

    const hasConfig = configurations.length > 0;

    // Handles CSV file parse result when no config exists
    const handleCsvForSetup = (importedData: any[]) => {
        if (importedData.length === 0) return;
        const headers = Object.keys(importedData[0]).filter(
            (h) => h !== 'Bil' && h !== 'bil',
        );
        setDetectedHeaders(headers);
        setPrimaryKeyHeader(headers[0] || '');
        setCsvRawData(importedData);
        setImportSiteId(currentSiteId ? String(currentSiteId) : '');
        setCsvConfigOpen(true);
    };

    const confirmCsvSetup = async () => {
        if (!primaryKeyHeader || !csvRawData) return;
        setConfiguring(true);

        try {
            const res = await fetch('/master-data/table-configurations/generate-from-headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    table_name: 'assets',
                    headers: detectedHeaders,
                    primary_key_header: primaryKeyHeader,
                    site_id: importSiteId || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create columns');
            }

            setCsvConfigOpen(false);
            toast.success('Table configured from CSV. Now importing data…');

            // Now proceed with import
            const selectedSite = sites.find((s) => String(s.id) === importSiteId);
            router.post(
                '/assets/import-bulk',
                { assets: csvRawData, site_name: selectedSite?.name || '', site_id: importSiteId || null },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Table configured and ${csvRawData.length} assets imported!`);
                        setCsvRawData(null);
                        setImportSiteId('');
                        router.reload({ only: ['assets', 'configurations', 'configuredSiteIds', 'totalSites'] });
                    },
                    onError: (err) => {
                        console.error(err);
                        toast.error('Import completed but data import failed. Columns were created.');
                        router.reload({ only: ['assets', 'configurations', 'configuredSiteIds', 'totalSites'] });
                    },
                },
            );
        } catch (e: any) {
            toast.error(e.message || 'Failed to configure from CSV');
        } finally {
            setConfiguring(false);
        }
    };

    // Standard import handler (when configs exist)
    const handleImportCsv = (importedData: any[]) => {
        if (!hasConfig) {
            handleCsvForSetup(importedData);
            return;
        }
        setPendingImportData(importedData);
    };

    const confirmImport = () => {
        if (!pendingImportData) return;
        const selectedSite = sites.find((s) => String(s.id) === importSiteId);
        const siteName = selectedSite?.name || '';

        router.post(
            '/assets/import-bulk',
            { assets: pendingImportData, site_name: siteName, site_id: importSiteId || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Imported ${pendingImportData.length} assets!`);
                    setPendingImportData(null);
                    setImportSiteId('');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Import failed.');
                    setPendingImportData(null);
                },
            },
        );
    };

    // ── Columns ──
    const columns = useMemo(() => {
        const cols: any[] = (configurations || [])
            .filter((cfg: any) => cfg.is_visible)
            .map((cfg: any) => ({
            accessorKey: cfg.column_key,
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title={titleMap[cfg.id] || cfg.column_title} configId={cfg.id} isAdmin={isAdmin} onTitleChange={handleTitleChange} />
            ),
            enableSorting: cfg.is_sortable,
            cell: ({ row }: any) => {
                const val = row.getValue(cfg.column_key);
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
                if (cfg.data_type === 'number') {
                    return <div className="text-right font-medium tabular-nums">{val}</div>;
                }
                return <span className="text-muted-foreground text-sm font-medium">{val ?? '—'}</span>;
            },
        }));

        // ── Hardcoded STATUS column (always present) ──
        const statusMap = Object.fromEntries(
            (assetStatuses || []).map((s: any) => [s.name, s.color])
        );

        cols.push({
            id: 'status',
            accessorKey: 'status',
            filterFn: (row: any, id: string, filterValue: string[]) => filterValue.includes(row.getValue(id)),
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const val = row.getValue('status') ?? 'NOT UPDATED';
                const color = statusMap[val] || '#6B7280';
                if (isAdmin) {
                    return (
                        <select
                            value={val}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                router.patch(
                                    `/assets/${row.original.id}/status`,
                                    { status: newStatus },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success('Status updated'),
                                        onError: (err) => toast.error('Failed to update status'),
                                    }
                                );
                            }}
                            className="rounded-md border-0 bg-transparent px-1 py-0.5 text-xs font-semibold cursor-pointer"
                            style={{ color: '#fff', backgroundColor: color }}
                        >
                            {(assetStatuses || []).map((s: any) => (
                                <option key={s.id} value={s.name} style={{ color: '#000', background: '#fff' }}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    );
                }
                return (
                    <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: color }}
                    >
                        {val}
                    </span>
                );
            },
        });

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
    }, [configurations, isAdmin, titleMap, assetStatuses]);

    const filteredAssets = React.useMemo(() => {
        if (statusFilter === 'all') return assets;
        return (assets || []).filter((a: any) => a.status === statusFilter);
    }, [assets, statusFilter]);

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
                        <p className="text-sm text-muted-foreground">Recent Added (30d)</p>
                        <p className="text-2xl font-bold">{totalRecentAdded ?? 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
                    <p className="text-sm text-muted-foreground">
                        {hasConfig
                            ? 'Manage IT assets and equipment'
                            : 'Configure your asset table to get started'}
                    </p>
                </div>
                {isAdmin && hasConfig && (
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => router.get('/assets/create')}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Asset
                    </Button>
                )}
            </div>

            {!hasConfig && sites.length === 0 ? (
                /* ── Empty state: no sites, no config ── */
                <div className="rounded-xl border-2 border-dashed bg-card p-16 text-center">
                    <Table2 className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Columns Configured</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                        Start by creating a site in Master Data, then import a CSV to
                        automatically detect and configure your columns.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" onClick={() => router.get('/master-data')}>
                            <MapPin className="mr-2 h-4 w-4" /> Create Site
                        </Button>
                        <FileImportButton onImport={handleCsvForSetup}>
                            <Upload className="mr-2 h-4 w-4" /> Import CSV &amp; Configure
                        </FileImportButton>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search + Site Filter + Import row */}
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
                            <Select value={currentSiteId ? String(currentSiteId) : ''} onValueChange={(v) => router.get('/assets', { site_id: v })}>
                                <SelectTrigger className="h-8 w-[200px] text-sm">
                                    <SelectValue placeholder={sites.find(s => String(s.id) === String(currentSiteId))?.name || 'Select site'} />
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
                                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DataTableActions
                            data={filteredAssets}
                            columns={columns}
                            exportFileName="asset_inventory_export"
                            onImportCsv={handleImportCsv}
                        />
                    </div>

                    {currentSiteHasConfig ? (
                        <DataTable columns={columns} data={filteredAssets} hideToolbar assetStatuses={assetStatuses} />
                    ) : (
                        <div className="rounded-xl border bg-card p-16 text-center">
                            <Table2 className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Site Not Configured</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                                This site has no asset table configuration yet. Import a CSV to
                                automatically detect and configure your columns.
                            </p>
                            <FileImportButton onImport={handleCsvForSetup}>
                                <Upload className="mr-2 h-4 w-4" /> Import CSV &amp; Configure
                            </FileImportButton>
                        </div>
                    )}
                </>
            )}

            {/* ── CSV Config dialog (no config → pick PK) ── */}
            <Dialog open={csvConfigOpen} onOpenChange={(v) => !v && setCsvConfigOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Configure from CSV</DialogTitle>
                        <DialogDescription>
                            {detectedHeaders.length} columns detected. Select which one is the
                            unique identifier (primary key).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 max-h-64 overflow-y-auto">
                        <Label>Detected Columns</Label>
                        {detectedHeaders.map((h) => (
                            <div
                                key={h}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${primaryKeyHeader === h
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:bg-accent/50'
                                    }`}
                                onClick={() => setPrimaryKeyHeader(h)}
                            >
                                <input
                                    type="radio"
                                    name="pk"
                                    checked={primaryKeyHeader === h}
                                    onChange={() => setPrimaryKeyHeader(h)}
                                    className="h-4 w-4 text-primary"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{h}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {primaryKeyHeader === h ? 'Primary key' : 'Click to set as primary key'}
                                    </div>
                                </div>
                                {primaryKeyHeader === h && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                                        PK
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Site selection for import */}
                    {sites.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="csv-config-site">Assign to Site (optional)</Label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger id="csv-config-site">
                                    <SelectValue placeholder="No site" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No site</SelectItem>
                                    {sites.map((site) => (
                                        <SelectItem key={site.id} value={String(site.id)}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setCsvConfigOpen(false); setCsvRawData(null); }}>
                            Cancel
                        </Button>
                        <Button onClick={confirmCsvSetup} disabled={configuring}>
                            {configuring ? 'Creating…' : 'Save & Import'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Standard import confirmation dialog ── */}
            <Dialog open={!!pendingImportData} onOpenChange={(o) => !o && setPendingImportData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import CSV</DialogTitle>
                        <DialogDescription>{pendingImportData?.length} assets detected.</DialogDescription>
                    </DialogHeader>

                    {sites.length > 0 && (
                        <div className="space-y-2 py-2">
                            <Label htmlFor="import-site">Assign to Site (optional)</Label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger id="import-site">
                                    <SelectValue placeholder="No site (use CSV data)" />
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
                        <Button variant="outline" onClick={() => setPendingImportData(null)}>Cancel</Button>
                        <Button onClick={confirmImport}>Confirm Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Reusable file picker button that returns parsed CSV data
function FileImportButton({
    children,
    onImport,
}: {
    children: React.ReactNode;
    onImport: (data: any[]) => void;
}) {
    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as string[][];
                    let headerRowIndex = 0;
                    for (let i = 0; i < Math.min(rows.length, 20); i++) {
                        const row = rows[i];
                        if (
                            row.some((cell) => {
                                const c = (cell || '').trim().toLowerCase();
                                return (
                                    c === 'aset id' ||
                                    c === 'asset id' ||
                                    c === 'asset_id' ||
                                    c === 'name' ||
                                    c === 'nama'
                                );
                            })
                        ) {
                            headerRowIndex = i;
                            break;
                        }
                    }
                    if (headerRowIndex >= rows.length) {
                        toast.error('Could not detect headers in CSV.');
                        return;
                    }
                    const headers = rows[headerRowIndex].map((h) => h.trim());
                    const dataRows = rows.slice(headerRowIndex + 1);
                    const parsedData = dataRows.map((row) => {
                        const obj: any = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });
                    onImport(parsedData);
                },
            });
        };
        input.click();
    };

    return (
        <Button onClick={handleClick}>
            {children}
        </Button>
    );
}

AssetIndex.layout = {
    breadcrumbs: [
        { title: 'Asset Inventory', href: '#' },
    ],
};
