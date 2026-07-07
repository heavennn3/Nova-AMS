import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, Package, Search, MapPin, Calendar, CheckSquare, Square } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export default function AssetLoansCreate({
    assets = [],
    sites = [],
    isAdmin = false,
    userSiteId = null,
    columns = [],
}: {
    assets: any[];
    sites: any[];
    isAdmin: boolean;
    userSiteId: number | null;
    columns: string[];
}) {
    const { data, setData, processing, errors } = useForm({
        asset_ids: [] as number[],
        site_id: '',
        loan_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        condition_status: 'good',
        purpose: '',
        notes: '',
    });

    const [assetSearch, setAssetSearch] = useState('');
    const [comboOpen, setComboOpen] = useState(false);
    const [page, setPage] = useState(0);
    const PER_PAGE = 5;

    // Admin can pick a site; non-admin fixed to their site
    const [selectedSiteId, setSelectedSiteId] = useState(isAdmin ? '' : String(userSiteId ?? ''));

    // Sync selectedSiteId to form
    React.useEffect(() => {
        if (selectedSiteId) setData('site_id', selectedSiteId);
    }, [selectedSiteId]);

    // Filter by site + search
    const filteredAssets = useMemo(() => {
        let list = assets;
        if (selectedSiteId) {
            list = list.filter((a: any) => a.site_id?.toString() === selectedSiteId);
        }
        if (assetSearch) {
            const q = assetSearch.toLowerCase();
            list = list.filter((a: any) =>
                Object.values(a.fields).some((v: any) =>
                    String(v ?? '').toLowerCase().includes(q)
                )
            );
        }
        return list;
    }, [assets, selectedSiteId, assetSearch]);

    // Paginate
    const pageCount = Math.max(1, Math.ceil(filteredAssets.length / PER_PAGE));
    const paginatedAssets = filteredAssets.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    // Reset page when filters change
    React.useEffect(() => { setPage(0); }, [selectedSiteId, assetSearch]);

    const toggleAsset = (id: number) => {
        setData('asset_ids',
            data.asset_ids.includes(id)
                ? data.asset_ids.filter(a => a !== id)
                : [...data.asset_ids, id]
        );
    };

    // Columns to display (limit to ~4-5 meaningful ones)
    const displayColumns = useMemo(() => {
        const priority = ['aset_id', 'jenis_aset', 'kategori_aset', 'lokasi', 'vendor', 'kuantiti'];
        return priority.filter(c => columns.includes(c)).slice(0, 5);
    }, [columns]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/asset-loans', data);
    };

    return (
        <>
            <Head title="New Asset Loan" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Asset Loan</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select assets to loan out.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: Select Site */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 1</Badge>
                            <h2 className="text-lg font-semibold">Select Site</h2>
                        </div>
                        <div className="p-6">
                            {isAdmin ? (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">
                                        <MapPin className="inline h-3.5 w-3.5 mr-1" />
                                        Site <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={selectedSiteId}
                                        onValueChange={(val) => {
                                            setSelectedSiteId(val);
                                            setData('asset_ids', []);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a site..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map((site: any) => (
                                                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.site_id} />
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Assets from your assigned site will be shown below.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Pick Assets (table + search combo) */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 2</Badge>
                            <h2 className="text-lg font-semibold">
                                <Package className="inline h-4 w-4 mr-1.5" />
                                Pick Assets
                                {data.asset_ids.length > 0 && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                                        ({data.asset_ids.length} selected)
                                    </span>
                                )}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {isAdmin && !selectedSiteId ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Please select a site first.
                                </div>
                            ) : (
                                <>
                                    {/* Search + Combo */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search assets..."
                                                className="pl-8"
                                                value={assetSearch}
                                                onChange={(e) => setAssetSearch(e.target.value)}
                                            />
                                        </div>
                                        <Popover open={comboOpen} onOpenChange={setComboOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="gap-2 whitespace-nowrap">
                                                    <Search className="h-4 w-4" />
                                                    Quick Pick
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="end">
                                                <Command>
                                                    <CommandInput placeholder="Search & pick..." />
                                                    <CommandList>
                                                        <CommandEmpty>No assets found.</CommandEmpty>
                                                        {filteredAssets.map((asset: any) => (
                                                            <CommandItem
                                                                key={asset.id}
                                                                onSelect={() => toggleAsset(asset.id)}
                                                            >
                                                                <div className="flex items-center gap-2 w-full">
                                                                    {data.asset_ids.includes(asset.id) ? (
                                                                        <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                                                                    ) : (
                                                                        <Square className="h-4 w-4 shrink-0" />
                                                                    )}
                                                                    <span className="truncate">
                                                                        {asset.fields.aset_id || asset.fields.jenis_aset || `Asset #${asset.id}`}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Table of available assets */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/50 border-b">
                                                    <th className="w-10 p-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded"
                                                            checked={filteredAssets.length > 0 && filteredAssets.every((a: any) => data.asset_ids.includes(a.id))}
                                                            onChange={() => {
                                                                const allIds = filteredAssets.map((a: any) => a.id);
                                                                const allSelected = allIds.every(id => data.asset_ids.includes(id));
                                                                setData('asset_ids', allSelected ? data.asset_ids.filter(id => !allIds.includes(id)) : [...data.asset_ids, ...allIds.filter(id => !data.asset_ids.includes(id))]);
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="p-3 text-left font-medium text-muted-foreground">#</th>
                                                    {displayColumns.map(col => (
                                                        <th key={col} className="p-3 text-left font-medium text-muted-foreground capitalize">
                                                            {col.replace(/_/g, ' ')}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {filteredAssets.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={displayColumns.length + 2} className="p-6 text-center text-sm text-muted-foreground">
                                                            No available assets{selectedSiteId ? '' : '.'}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    paginatedAssets.map((asset: any, idx: number) => (
                                                        <tr
                                                            key={asset.id}
                                                            className={`cursor-pointer transition-colors hover:bg-muted/30 ${data.asset_ids.includes(asset.id) ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : ''}`}
                                                            onClick={() => toggleAsset(asset.id)}
                                                        >
                                                            <td className="p-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded"
                                                                    checked={data.asset_ids.includes(asset.id)}
                                                                    onChange={() => toggleAsset(asset.id)}
                                                                />
                                                            </td>
                                                            <td className="p-3 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                                                            {displayColumns.map(col => (
                                                                <td key={col} className="p-3">
                                                                    {asset.fields[col] || <span className="text-muted-foreground/40">—</span>}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                        {/* Pagination */}
                                        {filteredAssets.length > PER_PAGE && (
                                            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
                                                <span className="text-xs text-muted-foreground">
                                                    Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filteredAssets.length)} of {filteredAssets.length}
                                                </span>
                                                <div className="flex gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={page === 0}
                                                        onClick={() => setPage(p => p - 1)}
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={page >= pageCount - 1}
                                                        onClick={() => setPage(p => p + 1)}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <InputError message={errors.asset_ids} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Loan Details */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 3</Badge>
                            <h2 className="text-lg font-semibold">
                                <Calendar className="inline h-4 w-4 mr-1.5" />
                                Loan Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Loan Date</Label>
                                    <Input
                                        type="date"
                                        value={data.loan_date}
                                        onChange={(e) => setData('loan_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <InputError message={errors.loan_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Expected Return Date</Label>
                                    <Input
                                        type="date"
                                        value={data.expected_return_date}
                                        onChange={(e) => setData('expected_return_date', e.target.value)}
                                        min={data.loan_date || new Date().toISOString().split('T')[0]}
                                    />
                                    <InputError message={errors.expected_return_date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Condition Status</Label>
                                <Select value={data.condition_status} onValueChange={(val) => setData('condition_status', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="semi_faulty">Semi-Faulty</SelectItem>
                                        <SelectItem value="faulty">Faulty</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.condition_status} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Purpose <span className="text-red-500">*</span></Label>
                                <Textarea
                                    placeholder="Why do you need this asset(s)?"
                                    value={data.purpose}
                                    onChange={(e) => setData('purpose', e.target.value)}
                                    className="min-h-[80px] resize-y"
                                />
                                <InputError message={errors.purpose} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Notes</Label>
                                <Textarea
                                    placeholder="Additional notes (optional)"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="min-h-[60px] resize-y"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => router.get('/asset-loans')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || data.asset_ids.length === 0 || !data.site_id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    <Send className="mr-2 h-4 w-4" /> Submit Loan ({data.asset_ids.length} asset{data.asset_ids.length !== 1 ? 's' : ''})
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

AssetLoansCreate.layout = {
    breadcrumbs: [
        { title: 'Asset Loans', href: '/asset-loans' },
        { title: 'New Loan', href: '/asset-loans/create' },
    ],
};
