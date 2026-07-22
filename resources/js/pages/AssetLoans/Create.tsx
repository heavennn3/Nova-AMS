import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ChevronDown, Filter, MapPin, Package, Search, Send, ShieldCheck, X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
const assetSearchText = (asset: Asset) => [
    asset.asset_id,
    fieldValue(asset, ['aset_id', 'asset_id']),
    asset.asset_name,
    fieldValue(asset, ['asset_name', 'nama_aset']),
    asset.serial_number,
    fieldValue(asset, ['serial_number', 'no_siri', 'sn']),
].filter(Boolean).join(' ').toLowerCase();
const assetCategory = (asset: Asset) => asset.category_name || fieldValue(asset, ['kategori_aset', 'category', 'kategori']) || '—';
const assetType = (asset: Asset) => asset.type_name || fieldValue(asset, ['jenis_aset', 'type', 'asset_type', 'product']) || '—';
const assetLocation = (asset: Asset) => asset.location || fieldValue(asset, ['location', 'lokasi', 'room', 'department']) || '—';

type ComboOption = { value: string; label: string };

function SearchCombo({
    id,
    value,
    options,
    placeholder,
    disabled = false,
    onChange,
}: {
    id: string;
    value: string;
    options: ComboOption[];
    placeholder: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.value === value);
    const filtered = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        if (!open) return;

        const closeOnOutsideTouch = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('pointerdown', closeOnOutsideTouch);
        return () => document.removeEventListener('pointerdown', closeOnOutsideTouch);
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            <Button
                id={id}
                type="button"
                variant="outline"
                disabled={disabled}
                className="h-10 w-full justify-between bg-background text-sm font-normal"
                onClick={() => setOpen((current) => !current)}
            >
                <span className={selected ? 'truncate' : 'truncate text-muted-foreground'}>{selected?.label || placeholder}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            {open && !disabled && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${placeholder.toLowerCase()}`} className="h-10 border-0 px-0 shadow-none focus-visible:ring-0" />
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="px-2 py-3 text-center text-sm text-muted-foreground">No results</div>
                        ) : filtered.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                    setQuery('');
                                }}
                            >
                                <span>{option.label}</span>
                                {option.value === value && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

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
    const [formErrors, setFormErrors] = useState<{ asset_ids?: string; site_id?: string; loan_date?: string; expected_return_date?: string; purpose?: string }>({});

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
            const matchesSearch = !q || assetSearchText(asset).includes(q);
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
        setFormErrors((current) => ({ ...current, asset_ids: '', site_id: '' }));
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
        const nextErrors = {
            asset_ids: data.asset_ids.length ? '' : 'Select at least one asset.',
            site_id: data.site_id ? '' : 'Site is required.',
            loan_date: data.loan_date ? '' : 'Loan date is required.',
            expected_return_date: data.expected_return_date ? '' : 'Expected return date is required.',
            purpose: data.purpose.trim() ? '' : 'Purpose is required.',
        };

        if (Object.values(nextErrors).some(Boolean)) {
            setFormErrors(nextErrors);
            return;
        }

        setFormErrors({});
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
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">New asset loan</h1>

                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Available</p>
                                        <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{assets.length}</p>
                                    </div>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                                        <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">Selected</p>
                                        <p className="mt-1 text-2xl font-semibold text-blue-700 dark:text-blue-300">{data.asset_ids.length}</p>
                                    </div>
                                    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
                                        <p className="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300">Access</p>
                                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300"><ShieldCheck className="h-4 w-4" /> {isAdmin ? 'All sites' : 'Assigned site only'}</p>
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
                                            <Input
                                                id="loan-date"
                                                type="date"
                                                min={today}
                                                value={data.loan_date}
                                                onChange={(e) => {
                                                    setData('loan_date', e.target.value);
                                                    if (formErrors.loan_date) setFormErrors((current) => ({ ...current, loan_date: '' }));
                                                }}
                                            />
                                        </div>
                                        <InputError message={formErrors.loan_date || errors.loan_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="return-date" className="font-medium">Expected return date</Label>
                                        <div className="relative">
                                            <Input
                                                id="return-date"
                                                type="date"
                                                min={data.loan_date || today}
                                                value={data.expected_return_date}
                                                onChange={(e) => {
                                                    setData('expected_return_date', e.target.value);
                                                    if (formErrors.expected_return_date) setFormErrors((current) => ({ ...current, expected_return_date: '' }));
                                                }}
                                            />
                                        </div>
                                        <InputError message={formErrors.expected_return_date || errors.expected_return_date} />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                                <div className="mb-4 flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                    <h2 className="font-medium text-blue-700 dark:text-blue-300">Find asset to loan</h2>
                                </div>
                                <div className={`grid gap-3 ${isAdmin ? 'lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]' : 'lg:grid-cols-[1.4fr_1fr_1fr_auto]'}`}>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="asset-search" placeholder="Search " value={search} onChange={(e) => resetPage(() => setSearch(e.target.value))} className="bg-background pl-10" />
                                    </div>
                                    {isAdmin && (
                                        <SearchCombo
                                            id="site-filter"
                                            value={siteFilter}
                                            disabled={data.asset_ids.length > 0}
                                            placeholder="All sites"
                                            options={[{ value: 'all', label: 'All sites' }, ...sites.map((site) => ({ value: String(site.id), label: site.name }))]}
                                            onChange={(value) => {
                                                resetPage(() => setSiteFilter(value));
                                                setFormErrors((current) => ({ ...current, site_id: '' }));
                                            }}
                                        />
                                    )}
                                    <SearchCombo
                                        id="category-filter"
                                        value={categoryFilter}
                                        placeholder="Category"
                                        options={[{ value: 'all', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))]}
                                        onChange={(value) => resetPage(() => setCategoryFilter(value))}
                                    />
                                    <SearchCombo
                                        id="type-filter"
                                        value={typeFilter}
                                        placeholder="Type"
                                        options={[{ value: 'all', label: 'All types' }, ...types.map((type) => ({ value: type, label: type }))]}
                                        onChange={(value) => resetPage(() => setTypeFilter(value))}
                                    />
                                    <Button type="button" variant="outline" onClick={clearFilters} className="bg-background"><X className="mr-2 h-4 w-4" /> Clear</Button>
                                </div>

                            </div>

                            <InputError message={formErrors.asset_ids || errors.asset_ids} />
                            <InputError message={formErrors.site_id || errors.site_id} />

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
                                            <button id={`asset-card-${asset.id}`} key={asset.id} type="button" onClick={() => toggleAsset(asset)} className={`group rounded-2xl border p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md ${selected ? 'border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10' : 'bg-background'}`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-base font-medium text-foreground">{assetTitle(asset)}</p>
                                                        <p className="mt-1 font-mono text-xs text-muted-foreground">{assetCode(asset)}</p>
                                                    </div>
                                                    {selected ? <CheckCircle2 className="h-6 w-6 shrink-0 text-blue-600" /> : <span className="h-6 w-6 shrink-0 rounded-full border-2 border-border group-hover:border-blue-300" />}
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
                                <p className="mt-1 text-sm text-muted-foreground">Fill details before submit.</p>

                                <div className="mt-5 space-y-3">
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                                        <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">Selected assets</p>
                                        <p className="mt-1 text-3xl font-semibold text-blue-700 dark:text-blue-300">{data.asset_ids.length}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="condition-status" className="font-medium">Condition status</Label>
                                        <SearchCombo
                                            id="condition-status"
                                            value={data.condition_status}
                                            placeholder="Condition status"
                                            options={[
                                                { value: 'good', label: 'Good' },
                                                { value: 'semi_faulty', label: 'Semi-Faulty' },
                                                { value: 'faulty', label: 'Faulty' },
                                            ]}
                                            onChange={(value) => setData('condition_status', value)}
                                        />
                                        <InputError message={errors.condition_status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="loan-purpose" className="font-medium">Purpose <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="loan-purpose"
                                            placeholder="Reason to withdraw"
                                            value={data.purpose}
                                            onChange={(e) => {
                                                setData('purpose', e.target.value);
                                                if (formErrors.purpose) setFormErrors((current) => ({ ...current, purpose: '' }));
                                            }}
                                            className="min-h-28 resize-y"
                                        />
                                        <InputError message={formErrors.purpose || errors.purpose} />
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
                                    <Button id="submit-loan-request" type="submit" disabled={processing} className="flex-1">
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
