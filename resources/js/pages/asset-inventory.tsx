import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Upload,
    Table2,
    MapPin,
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';
import { toast } from 'sonner';

export default function AssetInventory({
    assets = [],
    configurations = [],
    sites = [],
}: any) {
    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState('all');

    // ── Import ──
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
    const [importSiteId, setImportSiteId] = useState<string>('');

    // ── No-config flow: detect CSV headers → pick PK → create configs ──
    const [csvConfigOpen, setCsvConfigOpen] = useState(false);
    const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
    const [primaryKeyHeader, setPrimaryKeyHeader] = useState<string>('');
    const [csvRawData, setCsvRawData] = useState<any[] | null>(null);
    const [configuring, setConfiguring] = useState(false);

    const hasConfig = configurations.length > 0;

    const columns = useMemo(() => {
        const cols: any[] = (configurations || []).map((cfg: any) => ({
            accessorKey: cfg.column_key,
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title={cfg.column_title} />
            ),
            enableSorting: cfg.is_sortable,
            cell: ({ row }: any) => {
                const val = row.getValue(cfg.column_key);

                if (cfg.is_primary_key) {
                    return (
                        <Link href={`/assets/${row.original.id}`} className="text-primary hover:underline font-mono font-semibold">
                            {val ?? '—'}
                        </Link>
                    );
                }

                if (cfg.data_type === 'number') {
                    return <div className="text-right font-medium">{val ?? '—'}</div>;
                }

                return <span>{val ?? '—'}</span>;
            },
        }));

        cols.push({
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
        });

        return cols;
    }, [configurations]);

    const configKeys = configurations?.map((c: any) => c.column_key) || [];
    const filteredAssets = useMemo(() => {
        let result = (assets || []).filter((a: any) => {
            if (siteFilter === 'all') return true;
            const lokasi = (a.lokasi || '').toLowerCase();
            const site = sites.find((s: any) => String(s.id) === siteFilter);
            return site && lokasi.includes(site.name.toLowerCase());
        });

        const q = search.toLowerCase();
        if (q) {
            result = result.filter((a: any) =>
                configKeys.some((key: string) => {
                    const v = a[key];
                    return v && String(v).toLowerCase().includes(q);
                }),
            );
        }

        return result;
    }, [assets, search, configKeys, siteFilter, sites]);

    // ── CSV: no-config setup ──

    const handleCsvForSetup = (importedData: any[]) => {
        if (importedData.length === 0) return;
        const headers = Object.keys(importedData[0]).filter(
            (h) => h !== 'Bil' && h !== 'bil',
        );
        setDetectedHeaders(headers);
        setPrimaryKeyHeader(headers[0] || '');
        setCsvRawData(importedData);
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
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create columns');
            }

            setCsvConfigOpen(false);
            toast.success('Table configured from CSV. Now importing data…');

            const selectedSite = sites.find((s: any) => String(s.id) === importSiteId);
            router.post(
                '/assets/import-bulk',
                { assets: csvRawData, site_name: selectedSite?.name || '' },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Table configured and ${csvRawData.length} assets imported!`);
                        setCsvRawData(null);
                        setImportSiteId('');
                        router.reload({ only: ['assets', 'configurations'] });
                    },
                    onError: (err) => {
                        console.error(err);
                        toast.error('Columns created but data import failed.');
                        router.reload({ only: ['assets', 'configurations'] });
                    },
                },
            );
        } catch (e: any) {
            toast.error(e.message || 'Failed to configure from CSV');
        } finally {
            setConfiguring(false);
        }
    };

    // ── CSV: standard import (configs exist) ──

    const handleImportCsv = (importedData: any[]) => {
        if (!hasConfig) {
            handleCsvForSetup(importedData);
            return;
        }
        setPendingImportData(importedData);
    };

    const confirmImport = () => {
        if (!pendingImportData) return;
        const selectedSite = sites.find((s: any) => String(s.id) === importSiteId);
        const siteName = selectedSite?.name || '';

        router.post(
            '/assets/import-bulk',
            { assets: pendingImportData, site_name: siteName },
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

    // ── File picker trigger ──

    const openFilePicker = () => {
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
                    handleImportCsv(parsedData);
                },
            });
        };
        input.click();
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Inventory" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asset Inventory</h1>
                    <p className="text-sm text-muted-foreground">
                        {hasConfig
                            ? 'All registered assets across all sites'
                            : 'Configure your asset table to get started'}
                    </p>
                </div>
                {hasConfig && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={openFilePicker}>
                            <Upload className="mr-2 h-4 w-4" /> Import CSV
                        </Button>
                        <Link href="/assets/create">
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> New Asset
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {!hasConfig ? (
                /* ── Empty state: no columns configured yet ── */
                <div className="rounded-xl border-2 border-dashed bg-card p-16 text-center">
                    <Table2 className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Columns Configured</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                        Start by creating a site in Master Data, then import a CSV to
                        automatically detect and configure your columns.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/master-data">
                            <Button variant="outline">
                                <MapPin className="mr-2 h-4 w-4" /> Create Site
                            </Button>
                        </Link>
                        <Button onClick={openFilePicker}>
                            <Upload className="mr-2 h-4 w-4" /> Import CSV &amp; Configure
                        </Button>
                    </div>
                </div>
            ) : (
                <>
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
                            <Select value={siteFilter} onValueChange={setSiteFilter}>
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
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    primaryKeyHeader === h
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

                    {sites.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="csv-config-site">Assign to Site (optional)</Label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger id="csv-config-site">
                                    <SelectValue placeholder="No site" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No site</SelectItem>
                                    {sites.map((site: any) => (
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
                        <DialogDescription>
                            {pendingImportData?.length} assets detected in CSV.
                        </DialogDescription>
                    </DialogHeader>

                    {sites.length > 0 && (
                        <div className="space-y-2 py-2">
                            <Label htmlFor="import-site">Assign to Site (optional)</Label>
                            <Select value={importSiteId} onValueChange={setImportSiteId}>
                                <SelectTrigger id="import-site">
                                    <SelectValue placeholder="No site (use CSV Lokasi)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No site (use CSV data)</SelectItem>
                                    {sites.map((site: any) => (
                                        <SelectItem key={site.id} value={String(site.id)}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                If the CSV already has a "Lokasi" column, this won't override it.
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
