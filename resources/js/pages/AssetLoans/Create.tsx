import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Search,
    Package,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Check,
} from 'lucide-react';
import InputError from '@/components/input-error';

const conditionOptions = [
    { value: 'good', label: 'Good', color: 'bg-green-500' },
    { value: 'semi_faulty', label: 'Semi Faulty', color: 'bg-yellow-500' },
    { value: 'faulty', label: 'Faulty', color: 'bg-red-500' },
];

export default function Create({
    assets = [],
    sites = [],
    currentUser,
}: {
    assets: any[];
    sites: any[];
    currentUser: { id: number; name: string; email: string };
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
    const [selectedSiteId, setSelectedSiteId] = useState('');

    // Get assets for the selected site
    const siteAssets = useMemo(() => {
        if (!selectedSiteId) return [];
        if (!assetSearch) return assets.filter((a: any) => String(a.site_id) === selectedSiteId);
        const q = assetSearch.toLowerCase();
        return assets.filter((a: any) =>
            String(a.site_id) === selectedSiteId && (
                a.product_name?.toLowerCase().includes(q) ||
                a.asset_id?.toLowerCase().includes(q) ||
                String(a.id).includes(q) ||
                a.brand?.toLowerCase().includes(q) ||
                a.serial_number?.toLowerCase().includes(q)
            )
        );
    }, [assets, selectedSiteId, assetSearch]);

    const toggleAsset = (id: number) => {
        setData('asset_ids',
            data.asset_ids.includes(id)
                ? data.asset_ids.filter((i) => i !== id)
                : [...data.asset_ids, id]
        );
    };

    const toggleAll = () => {
        const allIds = siteAssets.map((a: any) => a.id);
        const allSelected = allIds.every((id: number) => data.asset_ids.includes(id));
        setData('asset_ids',
            allSelected ? data.asset_ids.filter((i) => !allIds.includes(i)) : [...new Set([...data.asset_ids, ...allIds])]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/asset-loans', data, {
            onSuccess: () => router.visit('/asset-loans'),
        });
    };

    const selectedSite = sites.find((s) => String(s.id) === selectedSiteId);

    return (
        <>
            <Head title="New Asset Loan" />
            <div className="p-8 max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/asset-loans">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Quick Asset Loan</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Site + Asset */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Site</label>
                            <Select value={selectedSiteId} onValueChange={(v) => { setSelectedSiteId(v); setAssetSearch(''); }}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Choose a site to see assets..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedSiteId && (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input placeholder="Search assets..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs shrink-0" onClick={toggleAll}>
                                        <Check className="h-3 w-3 mr-1" /> All
                                    </Button>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-0.5 border rounded-md">
                                    {siteAssets.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-muted-foreground">No assets at this site</p>
                                    ) : (
                                        siteAssets.map((asset: any) => {
                                            const selected = data.asset_ids.includes(asset.id);
                                            return (
                                                <button key={asset.id} type="button"
                                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/30 ${selected ? 'bg-primary/5' : ''}`}
                                                    onClick={() => toggleAsset(asset.id)}
                                                >
                                                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                                        {selected && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <span className="font-medium">{asset.asset_id || `#${asset.id}`}</span>
                                                    {asset.product_name && <span className="text-muted-foreground ml-1">· {asset.product_name}</span>}
                                                    {asset.serial_number && <span className="text-muted-foreground">· {asset.serial_number}</span>}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {data.asset_ids.length > 0 && (
                                    <p className="mt-2 text-xs text-muted-foreground">{data.asset_ids.length} asset(s) selected</p>
                                )}
                            </>
                        )}
                        <InputError message={errors.asset_ids} />
                    </div>

                    {/* Borrower + Dates */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-card p-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Borrower</label>
                            <p className="text-sm font-medium truncate">{currentUser.name}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Loan Date</label>
                            <Input type="date" value={data.loan_date} onChange={(e) => setData('loan_date', e.target.value)} className="h-8 text-xs" />
                            <InputError message={errors.loan_date} />
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Expected Return</label>
                            <Input type="date" value={data.expected_return_date} onChange={(e) => setData('expected_return_date', e.target.value)} min={data.loan_date} className="h-8 text-xs" />
                            <InputError message={errors.expected_return_date} />
                        </div>
                    </div>

                    {/* Condition + Site (already selected above) */}
                    <div className="rounded-lg border bg-card p-3">
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Condition</label>
                        <div className="flex gap-1.5">
                            {conditionOptions.map((opt) => (
                                <button key={opt.value} type="button"
                                    className={`flex-1 rounded-md border py-2 text-xs font-medium transition-all ${data.condition_status === opt.value ? `${opt.color} text-white border-transparent` : 'border-muted hover:bg-muted/50'}`}
                                    onClick={() => setData('condition_status', opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <InputError message={errors.condition_status} />
                    </div>

                    {/* Purpose + Notes */}
                    <div className="rounded-lg border bg-card p-3 space-y-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Purpose</label>
                            <Input value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} placeholder="e.g. Field inspection" className="h-8 text-sm" />
                            <InputError message={errors.purpose} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
                            <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Any additional info..." className="text-sm" rows={2} />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Link href="/asset-loans"><Button type="button" variant="outline" size="sm">Cancel</Button></Link>
                        <Button type="submit" size="sm" disabled={processing || data.asset_ids.length === 0}>Submit Loan Request</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
