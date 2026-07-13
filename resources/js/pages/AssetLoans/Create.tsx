import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Filter, MapPin, Package, Search, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Asset = { id: number; site_id: number | null; fields: Record<string, unknown> };
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

const assetTitle = (asset: Asset) => fieldValue(asset, ['asset_name', 'nama_aset', 'jenis_aset', 'product', 'aset_id', 'asset_id']) || `Asset #${asset.id}`;
const assetCode = (asset: Asset) => fieldValue(asset, ['aset_id', 'asset_id', 'serial_number', 'no_siri']) || `#${asset.id}`;
const assetCategory = (asset: Asset) => fieldValue(asset, ['kategori_aset', 'category', 'kategori']) || 'Uncategorized';
const assetType = (asset: Asset) => fieldValue(asset, ['jenis_aset', 'type', 'asset_type', 'product']) || 'Unspecified';
const assetLocation = (asset: Asset) => fieldValue(asset, ['location', 'lokasi', 'room', 'department']) || 'No location';

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

            <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_32%),linear-gradient(180deg,rgba(248,250,252,1),rgba(240,253,250,0.55))] p-4 sm:p-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/85 shadow-2xl shadow-emerald-950/10 backdrop-blur">
                        <div className="relative p-6 sm:p-8">
                            <div className="absolute right-8 top-6 hidden h-28 w-28 rounded-full bg-emerald-300/30 blur-3xl sm:block" />
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-3">
                                    <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                        <Sparkles className="mr-1 h-3.5 w-3.5" /> Stored assets only
                                    </Badge>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Create asset loan</h1>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-600">Pick loan dates, filter stored assets, and submit request from allowed site inventory.</p>
                                    </div>
                                </div>
                                <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-fit rounded-full bg-white/80">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Available</p>
                                    <p className="mt-1 text-2xl font-black text-slate-950">{assets.length}</p>
                                </div>
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Selected</p>
                                    <p className="mt-1 text-2xl font-black text-slate-950">{data.asset_ids.length}</p>
                                </div>
                                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Access</p>
                                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-950"><ShieldCheck className="h-4 w-4" /> {isAdmin ? 'All sites' : 'Assigned site only'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
                        <section className="space-y-5 rounded-3xl border bg-white/90 p-5 shadow-xl shadow-slate-950/5 backdrop-blur">
                            <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end">
                                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-date" className="font-semibold">Loan date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                                            <Input id="loan-date" type="date" min={today} value={data.loan_date} onChange={(e) => setData('loan_date', e.target.value)} className="pl-10" />
                                        </div>
                                        <InputError message={errors.loan_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="return-date" className="font-semibold">Expected return date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                                            <Input id="return-date" type="date" min={data.loan_date || today} value={data.expected_return_date} onChange={(e) => setData('expected_return_date', e.target.value)} className="pl-10" />
                                        </div>
                                        <InputError message={errors.expected_return_date} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-emerald-600" />
                                    <h2 className="font-bold text-slate-950">Find asset to loan</h2>
                                </div>
                                <div className={`grid gap-3 ${isAdmin ? 'lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]' : 'lg:grid-cols-[1.4fr_1fr_1fr_auto]'}`}>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input id="asset-search" placeholder="Search asset ID, serial, name, location..." value={search} onChange={(e) => resetPage(() => setSearch(e.target.value))} className="bg-white pl-10" />
                                    </div>
                                    {isAdmin && (
                                        <Select value={siteFilter} onValueChange={(value) => resetPage(() => setSiteFilter(value))} disabled={data.asset_ids.length > 0}>
                                            <SelectTrigger id="site-filter" className="bg-white"><SelectValue placeholder="All sites" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All sites</SelectItem>
                                                {sites.map((site) => <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <Select value={categoryFilter} onValueChange={(value) => resetPage(() => setCategoryFilter(value))}>
                                        <SelectTrigger id="category-filter" className="bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All categories</SelectItem>
                                            {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={typeFilter} onValueChange={(value) => resetPage(() => setTypeFilter(value))}>
                                        <SelectTrigger id="type-filter" className="bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            {types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" onClick={clearFilters} className="bg-white"><X className="mr-2 h-4 w-4" /> Clear</Button>
                                </div>
                                {data.asset_ids.length > 0 && <p className="mt-3 text-xs text-slate-500">More assets can be selected from same site only. Clear selected assets to switch site.</p>}
                            </div>

                            <InputError message={errors.asset_ids} />
                            <InputError message={errors.site_id} />

                            <div className="grid gap-3 md:grid-cols-2">
                                {paginatedAssets.length === 0 ? (
                                    <div className="col-span-full rounded-3xl border border-dashed bg-white p-12 text-center text-slate-500">
                                        <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                        <p className="font-semibold text-slate-700">No stored assets found</p>
                                        <p className="mt-1 text-sm">Try different search, category, type, or site filter.</p>
                                    </div>
                                ) : (
                                    paginatedAssets.map((asset) => {
                                        const selected = data.asset_ids.includes(asset.id);

                                        return (
                                            <button id={`asset-card-${asset.id}`} key={asset.id} type="button" onClick={() => toggleAsset(asset)} className={`group rounded-3xl border p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${selected ? 'border-emerald-300 bg-emerald-50 shadow-emerald-950/10' : 'border-slate-200 bg-white hover:border-emerald-200'}`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-black text-slate-950">{assetTitle(asset)}</p>
                                                        <p className="mt-1 font-mono text-xs text-slate-500">{assetCode(asset)}</p>
                                                    </div>
                                                    {selected ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : <span className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-200 group-hover:border-emerald-300" />}
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{assetCategory(asset)}</Badge>
                                                    <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">{assetType(asset)}</Badge>
                                                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Stored</Badge>
                                                </div>
                                                <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {assetLocation(asset)}</p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {filteredAssets.length > PER_PAGE && (
                                <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
                                    <p className="text-sm text-slate-500">Showing {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filteredAssets.length)} of {filteredAssets.length}</p>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Prev</Button>
                                        <Button type="button" variant="outline" disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <aside className="space-y-5">
                            <section className="sticky top-6 rounded-3xl border bg-white/95 p-5 shadow-xl shadow-slate-950/10 backdrop-blur">
                                <h2 className="text-lg font-black text-slate-950">Loan summary</h2>
                                <p className="mt-1 text-sm text-slate-500">Review details before submit.</p>

                                <div className="mt-5 space-y-3">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected assets</p>
                                        <p className="mt-1 text-3xl font-black text-slate-950">{data.asset_ids.length}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="condition-status" className="font-semibold">Condition status</Label>
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
                                        <Label htmlFor="loan-purpose" className="font-semibold">Purpose <span className="text-red-500">*</span></Label>
                                        <Textarea id="loan-purpose" placeholder="Explain why asset loan needed." value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} className="min-h-28 resize-y" />
                                        <InputError message={errors.purpose} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-notes" className="font-semibold">Notes</Label>
                                        <Textarea id="loan-notes" placeholder="Optional handover notes." value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="min-h-20 resize-y" />
                                        <InputError message={errors.notes} />
                                    </div>
                                </div>

                                {selectedAssets.length > 0 && (
                                    <div className="mt-5 space-y-2 rounded-2xl border bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chosen</p>
                                        {selectedAssets.slice(0, 4).map((asset) => (
                                            <div key={asset.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                                                <span className="truncate font-medium text-slate-700">{assetTitle(asset)}</span>
                                                <button type="button" onClick={() => toggleAsset(asset)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                        {selectedAssets.length > 4 && <p className="text-xs text-slate-500">+{selectedAssets.length - 4} more</p>}
                                    </div>
                                )}

                                <div className="mt-5 flex gap-3 border-t pt-5">
                                    <Button type="button" variant="outline" onClick={() => window.location.assign('/asset-loans')} className="flex-1">Cancel</Button>
                                    <Button id="submit-loan-request" type="submit" disabled={processing || data.asset_ids.length === 0 || !data.site_id || !data.expected_return_date} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/20 hover:from-emerald-700 hover:to-teal-700">
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
