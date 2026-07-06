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
        asset_id: '',
        site_id: '',
        loan_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        condition_status: 'good',
        purpose: '',
        notes: '',
    });

    const [assetSearch, setAssetSearch] = useState('');

    const filteredAssets = useMemo(() => {
        if (!assetSearch) return assets;
        const q = assetSearch.toLowerCase();
        return assets.filter((a) =>
            a.product_name?.toLowerCase().includes(q) ||
            a.asset_id?.toLowerCase().includes(q) ||
            a.brand?.toLowerCase().includes(q) ||
            a.serial_number?.toLowerCase().includes(q)
        );
    }, [assets, assetSearch]);

    const selectedAsset = assets.find((a) => a.id === Number(data.asset_id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/asset-loans', data, {
            onSuccess: () => router.visit('/asset-loans'),
        });
    };

    return (
        <>
            <Head title="New Asset Loan" />
            <div className="p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/asset-loans">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Quick Asset Loan</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Asset */}
                    <div className="rounded-lg border bg-card p-4">
                        <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Asset</label>
                        {selectedAsset ? (
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Package className="h-5 w-5 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{selectedAsset.product_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{selectedAsset.asset_id} · {selectedAsset.brand || '—'}</p>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" className="h-7 shrink-0" onClick={() => { setData('asset_id', ''); setAssetSearch(''); }}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input placeholder="Search asset..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                                </div>
                                <div className="max-h-36 overflow-y-auto space-y-0.5">
                                    {filteredAssets.length === 0 ? (
                                        <p className="py-4 text-center text-xs text-muted-foreground">No available assets</p>
                                    ) : (
                                        filteredAssets.map((asset) => (
                                            <button key={asset.id} type="button"
                                                className={`w-full rounded border px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50 ${data.asset_id === String(asset.id) ? 'border-primary bg-primary/5' : ''}`}
                                                onClick={() => setData('asset_id', String(asset.id))}
                                            >
                                                <span className="font-medium">{asset.product_name}</span>
                                                <span className="text-muted-foreground"> · {asset.asset_id}</span>
                                                {asset.site && <span className="text-muted-foreground"> · {asset.site.name}</span>}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                        <InputError message={errors.asset_id} />
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

                    {/* Condition + Site */}
                    <div className="grid grid-cols-2 gap-3">
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
                        <div className="rounded-lg border bg-card p-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wide">Site</label>
                            <Select value={data.site_id} onValueChange={(v) => setData('site_id', v === 'none' ? '' : v)}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No site</SelectItem>
                                    {sites.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.site_id} />
                        </div>
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
                        <Button type="submit" size="sm" disabled={processing || !data.asset_id}>Submit Loan Request</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
