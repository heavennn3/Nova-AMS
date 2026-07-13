import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Filter, MapPin, Package, Search, Send, ShieldCheck, X } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Asset = {
    id: number;
    site_id: number | null;
    fields: Record<string, unknown>;
    asset_name?: string | null;
    asset_id?: string | null;
    serial_number?: string | null;
    part_number?: string | null;
    location?: string | null;
    category_name?: string | null;
    type_name?: string | null;
    oem_name?: string | null;
    site_name?: string | null;
};
type Site = { id: number; name: string };

const today = new Date().toLocaleDateString('en-CA');
const PER_PAGE = 8;

const fieldValue = (asset: Asset, keys: string[]) => {
    for (const key of keys) {
        const value = asset.fields?.[key];

        if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value);
        }
    }

    return '';
};

const assetTitle = (asset: Asset) => asset.asset_name || fieldValue(asset, ['asset_name', 'nama_aset', 'jenis_aset', 'product', 'aset_id', 'asset_id']) || `Asset #${asset.id}`;
const assetCode = (asset: Asset) => asset.asset_id || asset.serial_number || fieldValue(asset, ['aset_id', 'asset_id', 'serial_number', 'no_siri']) || `#${asset.id}`;
const assetCategory = (asset: Asset) => asset.category_name || fieldValue(asset, ['kategori_aset', 'category', 'kategori']) || '—';
const assetType = (asset: Asset) => asset.type_name || fieldValue(asset, ['jenis_aset', 'type', 'asset_type', 'product']) || '—';
const assetLocation = (asset: Asset) => asset.location || fieldValue(asset, ['location', 'lokasi', 'room', 'department']) || '—';

export default function AssetLoansCreate({
    assets = [],
    sites = [],
    isAdmin = false,
    userSiteId = null,
}: {
    assets: Asset[];
    sites: Site[];
    isAdmin: boolean;
    userSiteId: number | null;
    columns: string[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        asset_ids: [] as number[],
        site_id: isAdmin ? '' : String(userSiteId ?? ''),
        loan_date: today,
        expected_return_date: '',
        condition_status: 'good',
        purpose: '',
        notes: '',
    });

    const [search, setSearch] = useState('');
    const [siteFilter, setSiteFilter] = useState(isAdmin ? 'all' : String(userSiteId ?? ''));
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(0);

    const selectedAssets = useMemo(() => assets.filter((asset) => data.asset_ids.includes(asset.id)), [assets, data.asset_ids]);
    const selectedSiteId = selectedAssets[0]?.site_id ? String(selectedAssets[0].site_id) : data.site_id;

    React.useEffect(() => {
        if (selectedSiteId !== data.site_id) {
            setData('site_id', selectedSiteId ?? '');
        }
    }, [data.site_id, selectedSiteId, setData]);

    const categories = useMemo(() => [...new Set(assets.map(assetCategory))].sort((a, b) => a.localeCompare(b)), [assets]);
    const types = useMemo(() => [...new Set(assets.map(assetType))].sort((a, b) => a.localeCompare(b)), [assets]);

    const filteredAssets = useMemo(() => {
        const q = search.trim().toLowerCase();

        return assets.filter((asset) => {
            const sameSite = !selectedAssets.length || asset.site_id === selectedAssets[0].site_id;
            const matchesSite = siteFilter === 'all' || String(asset.site_id ?? '') === siteFilter;
            const matchesSearch =
                !q ||
                [assetTitle(asset), assetCode(asset), assetCategory(asset), assetType(asset), assetLocation(asset)].join(' ').toLowerCase().includes(q) ||
                Object.values(asset.fields ?? {}).some((value) => String(value ?? '').toLowerCase().includes(q));
            const matchesCategory = categoryFilter === 'all' || assetCategory(asset) === categoryFilter;
            const matchesType = typeFilter === 'all' || assetType(asset) === typeFilter;

            return sameSite && matchesSite && matchesSearch && matchesCategory && matchesType;
        });
    }, [assets, categoryFilter, search, selectedAssets, siteFilter, typeFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredAssets.length / PER_PAGE));
    const paginatedAssets = filteredAssets.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    const resetPage = (callback: () => void) => {
        callback();
        setPage(0);
    };

    const toggleAsset = (asset: Asset) => {
        const exists = data.asset_ids.includes(asset.id);
        const nextIds = exists ? data.asset_ids.filter((id) => id !== asset.id) : [...data.asset_ids, asset.id];
        const nextSiteId = nextIds.length ? String(asset.site_id ?? '') : isAdmin ? '' : String(userSiteId ?? '');

        setData((current) => ({ ...current, asset_ids: nextIds, site_id: nextSiteId }));
    };

    const clearFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setTypeFilter('all');
        setSiteFilter(isAdmin ? 'all' : String(userSiteId ?? ''));
        setPage(0);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/asset-loans');
    };

    return (
        <>
            <Head title="Create Asset Loan" />

            <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="rounded-2xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="w-fit">
                                    Asset loan
                                </Badge>
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Create asset loan</h1>
                                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Pick dates, filter stored assets, and submit request from allowed site inventory.</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border bg-background p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available</p>
                                        <p className="mt-1 text-2xl font-semibold text-foreground">{assets.length}</p>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected</p>
                                        <p className="mt-1 text-2xl font-semibold text-foreground">{data.asset_ids.length}</p>
                                    </div>
                                    <div className="rounded-lg border bg-background p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Access</p>
                                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> {isAdmin ? 'All sites' : 'Assigned site only'}</p>
                                    </div>
                                </div>
                            </div>
                            <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-fit">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        </div>
                    </section>

                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                        <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end">
                                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-date" className="font-medium">Loan date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="loan-date" type="date" min={today} value={data.loan_date} onChange={(e) => setData('loan_date', e.target.value)} className="pl-10" />
                                        </div>
                                        <InputError message={errors.loan_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="return-date" className="font-medium">Expected return date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input id="return-date" type="date" min={data.loan_date || today} value={data.expected_return_date} onChange={(e) => setData('expected_return_date', e.target.value)} className="pl-10" />
                                        </div>
                                        <InputError message={errors.expected_return_date} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <h2 className="font-medium text-foreground">Find asset to loan</h2>
                                </div>
                                <div className={`grid gap-3 ${isAdmin ? 'lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]' : 'lg:grid-cols-[1.4fr_1fr_1fr_auto]'}`}>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="asset-search" placeholder="Search asset ID, serial, name, location..." value={search} onChange={(e) => resetPage(() => setSearch(e.target.value))} className="bg-background pl-10" />
                                    </div>
                                    {isAdmin && (
                                        <Select value={siteFilter} onValueChange={(value) => resetPage(() => setSiteFilter(value))} disabled={data.asset_ids.length > 0}>
                                            <SelectTrigger id="site-filter" className="bg-background"><SelectValue placeholder="All sites" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All sites</SelectItem>
                                                {sites.map((site) => <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <Select value={categoryFilter} onValueChange={(value) => resetPage(() => setCategoryFilter(value))}>
                                        <SelectTrigger id="category-filter" className="bg-background"><SelectValue placeholder="Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All categories</SelectItem>
                                            {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={typeFilter} onValueChange={(value) => resetPage(() => setTypeFilter(value))}>
                                        <SelectTrigger id="type-filter" className="bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            {types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" onClick={clearFilters} className="bg-background"><X className="mr-2 h-4 w-4" /> Clear</Button>
                                </div>
                                {data.asset_ids.length > 0 && <p className="mt-3 text-xs text-muted-foreground">More assets can be selected from same site only. Clear selected assets to switch site.</p>}
                            </div>

                            <InputError message={errors.asset_ids} />
                            <InputError message={errors.site_id} />

                            <div className="grid gap-3 md:grid-cols-2">
                                {paginatedAssets.length === 0 ? (
                                    <div className="col-span-full rounded-2xl border border-dashed bg-background p-12 text-center text-muted-foreground">
                                        <Package className="mx-auto mb-3 h-12 w-12 opacity-40" />
                                        <p className="font-medium text-foreground">No stored assets found</p>
                                        <p className="mt-1 text-sm">Try different search, category, type, or site filter.</p>
                                    </div>
                                ) : (
                                    paginatedAssets.map((asset) => {
                                        const selected = data.asset_ids.includes(asset.id);

                                        return (
                                            <button id={`asset-card-${asset.id}`} key={asset.id} type="button" onClick={() => toggleAsset(asset)} className={`group rounded-2xl border p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md ${selected ? 'border-primary bg-primary/5' : 'bg-background'}`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-medium text-foreground">{assetTitle(asset)}</p>
                                                        <p className="mt-1 font-mono text-xs text-muted-foreground">{assetCode(asset)}</p>
                                                    </div>
                                                    {selected ? <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" /> : <span className="h-6 w-6 shrink-0 rounded-full border-2 border-border group-hover:border-primary/50" />}
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="rounded-full">{assetCategory(asset)}</Badge>
                                                    <Badge variant="outline" className="rounded-full">{assetType(asset)}</Badge>
                                                    {asset.oem_name && <Badge variant="outline" className="rounded-full">{asset.oem_name}</Badge>}
                                                </div>
                                                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                                                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {assetLocation(asset)}</p>
                                                    {asset.site_name && <p>{asset.site_name}</p>}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {filteredAssets.length > PER_PAGE && (
                                <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
                                    <p className="text-sm text-muted-foreground">Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filteredAssets.length)} of {filteredAssets.length}</p>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Prev</Button>
                                        <Button type="button" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <aside className="space-y-5">
                            <section className="sticky top-6 rounded-2xl border bg-card p-5 shadow-sm">
                                <h2 className="text-lg font-semibold text-foreground">Loan summary</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Review details before submit.</p>

                                <div className="mt-5 space-y-3">
                                    <div className="rounded-lg border bg-background p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected assets</p>
                                        <p className="mt-1 text-3xl font-semibold text-foreground">{data.asset_ids.length}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="condition-status" className="font-medium">Condition status</Label>
                                        <Select value={data.condition_status} onValueChange={(value) => setData('condition_status', value)}>
                                            <SelectTrigger id="condition-status"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="good">Good</SelectItem>
                                                <SelectItem value="semi_faulty">Semi-Faulty</SelectItem>
                                                <SelectItem value="faulty">Faulty</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.condition_status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-purpose" className="font-medium">Purpose <span className="text-red-500">*</span></Label>
                                        <Textarea id="loan-purpose" placeholder="Explain why asset loan needed." value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} className="min-h-28 resize-y" />
                                        <InputError message={errors.purpose} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-notes" className="font-medium">Notes</Label>
                                        <Textarea id="loan-notes" placeholder="Optional handover notes." value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="min-h-20 resize-y" />
                                        <InputError message={errors.notes} />
                                    </div>
                                </div>

                                {selectedAssets.length > 0 && (
                                    <div className="mt-5 space-y-2 rounded-lg border bg-background p-3">
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chosen</p>
                                        {selectedAssets.slice(0, 4).map((asset) => (
                                            <div key={asset.id} className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm">
                                                <span className="truncate font-medium text-foreground">{assetTitle(asset)}</span>
                                                <button type="button" onClick={() => toggleAsset(asset)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                        {selectedAssets.length > 4 && <p className="text-xs text-muted-foreground">+{selectedAssets.length - 4} more</p>}
                                    </div>
                                )}

                                <div className="mt-5 flex gap-3 border-t pt-5">
                                    <Button type="button" variant="outline" onClick={() => window.location.assign('/asset-loans')} className="flex-1">Cancel</Button>
                                    <Button id="submit-loan-request" type="submit" disabled={processing || data.asset_ids.length === 0 || !data.site_id || !data.expected_return_date} className="flex-1">
                                        <Send className="mr-2 h-4 w-4" /> Submit
                                    </Button>
                                </div>
                            </section>
                        </aside>
                    </form>
                </div>
            </main>
        </>
    );
}

AssetLoansCreate.layout = {
    breadcrumbs: [
        { title: 'Asset Loans', href: '/asset-loans' },
        { title: 'New Loan', href: '/asset-loans/create' },
    ],
};
