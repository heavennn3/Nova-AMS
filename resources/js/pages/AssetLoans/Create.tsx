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
import { ArrowLeft, Send, Package, Search, MapPin, Calendar } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';

export default function AssetLoansCreate({
    assetTypes = [],
    assets = [],
    sites = [],
    isAdmin = false,
    userSiteId = null,
}: {
    assetTypes: any[];
    assets: any[];
    sites: any[];
    isAdmin: boolean;
    userSiteId: number | null;
}) {
    const { data, setData, processing, errors } = useForm({
        asset_id: '',
        site_id: '',
        loan_date: '',
        expected_return_date: '',
        condition_status: 'good',
        purpose: '',
        notes: '',
    });

    const [selectedAssetTypeId, setSelectedAssetTypeId] = useState('');
    const [assetSearch, setAssetSearch] = useState('');

    // Admin can pick a site; non-admin fixed to their site
    const [selectedSiteId, setSelectedSiteId] = useState(isAdmin ? '' : String(userSiteId ?? ''));

    // Sync selectedSiteId to form data
    React.useEffect(() => {
        if (selectedSiteId) setData('site_id', selectedSiteId);
    }, [selectedSiteId]);

    // Filter assets by selected site
    const siteFilteredAssets = useMemo(() => {
        let list = assets;
        if (selectedSiteId) {
            list = list.filter((a: any) => a.site_id?.toString() === selectedSiteId);
        }
        return list;
    }, [assets, selectedSiteId]);

    // Further filter by asset type and search
    const filteredAssets = useMemo(() => {
        let list = siteFilteredAssets;
        if (selectedAssetTypeId) {
            list = list.filter((a: any) => a.type_id?.toString() === selectedAssetTypeId);
        }
        if (assetSearch) {
            const q = assetSearch.toLowerCase();
            list = list.filter((a: any) => a.label?.toLowerCase().includes(q));
        }
        return list;
    }, [siteFilteredAssets, selectedAssetTypeId, assetSearch]);

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
                            Request to borrow or check out an asset.
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
                                            setData('asset_id', '');
                                            setSelectedAssetTypeId('');
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

                    {/* Step 2: Select Asset */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 2</Badge>
                            <h2 className="text-lg font-semibold">
                                <Package className="inline h-4 w-4 mr-1.5" />
                                Select Asset
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {isAdmin && !selectedSiteId ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Please select a site first.
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Asset Type <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={selectedAssetTypeId}
                                            onValueChange={(val) => {
                                                setSelectedAssetTypeId(val);
                                                setData('asset_id', '');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose asset type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assetTypes.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedAssetTypeId && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Available Assets
                                                    <span className="text-muted-foreground font-normal ml-1">({filteredAssets.length} available)</span>
                                                </Label>
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search assets..."
                                                        className="pl-8"
                                                        value={assetSearch}
                                                        onChange={(e) => setAssetSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="max-h-[250px] overflow-y-auto border rounded-lg divide-y">
                                                {filteredAssets.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No available assets for this type.
                                                    </div>
                                                ) : (
                                                    filteredAssets.map((asset: any) => (
                                                        <button
                                                            key={asset.id}
                                                            type="button"
                                                            onClick={() => setData('asset_id', asset.id.toString())}
                                                            className={`w-full flex items-center justify-between p-3 text-left text-sm transition-colors ${data.asset_id === asset.id.toString()
                                                                    ? 'bg-primary/5 border-l-2 border-l-primary'
                                                                    : 'hover:bg-muted/30'
                                                                }`}
                                                        >
                                                            <div className="font-medium">{asset.label}</div>
                                                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                                                                Available
                                                            </Badge>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                            <InputError message={errors.asset_id} />
                                        </>
                                    )}
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
                                    placeholder="Why do you need this asset?"
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
                                    disabled={processing || !data.asset_id || !data.site_id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    <Send className="mr-2 h-4 w-4" /> Submit Loan Request
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
