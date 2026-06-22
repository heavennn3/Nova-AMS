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
import {
    ArrowLeft,
    ArrowDownToLine,
    Search,
    Package,
    CheckCircle2,
    User,
    Calendar,
    Monitor,
    Server,
    HardDrive,
    MapPin,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';

export default function Checkout({
    categories = [],
    assetTypes = [],
    assets = [],
    currentUser,
}: {
    categories: any[];
    assetTypes: any[];
    assets: any[];
    currentUser: { id: number; name: string; email: string };
}) {
    const { data, setData, processing, errors } = useForm({
        asset_id: '',
        reason: '',
        expected_return: '',
        checkout_date: new Date().toISOString().split('T')[0],
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [assetSearch, setAssetSearch] = useState('');

    // Filter assets by category + search
    const filteredAssets = useMemo(() => {
        let list = assets;
        if (selectedCategoryId) {
            list = list.filter(a => a.category_id?.toString() === selectedCategoryId);
        }
        if (assetSearch) {
            const q = assetSearch.toLowerCase();
            list = list.filter(a =>
                a.product_name?.toLowerCase().includes(q) ||
                a.asset_id?.toLowerCase().includes(q) ||
                a.brand?.toLowerCase().includes(q) ||
                a.serial_number?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [assets, selectedCategoryId, assetSearch]);

    const selectedAsset = assets.find(a => a.id.toString() === data.asset_id);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/checkout', {
            asset_id: data.asset_id,
            reason: data.reason,
            expected_return: data.expected_return || null,
        });
    };

    const categoryCount = (catId: string) => assets.filter(a => a.category_id?.toString() === catId).length;

    return (
        <>
            <Head title="Check Out Asset" />

            <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-lg shadow-emerald-500/20">
                            <ArrowDownToLine className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Check Out Asset</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Select an asset category, choose an asset, and complete checkout
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/checkout')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                {/* Checkout Person Card */}
                <div className="rounded-xl border bg-gradient-to-r from-slate-50 to-blue-50/50 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Checkout Person</div>
                            <div className="font-bold text-lg text-foreground">{currentUser.name}</div>
                            <div className="text-xs text-muted-foreground">{currentUser.email}</div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-xs gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            Auto-assigned
                        </Badge>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: Asset Category */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b px-6 py-4 flex items-center gap-3">
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm">1</span>
                            <h2 className="text-lg font-semibold text-emerald-900">Select Asset Category</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categories.map((cat: any) => {
                                    const isSelected = selectedCategoryId === cat.id.toString();
                                    const count = categoryCount(cat.id.toString());
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategoryId(cat.id.toString());
                                                setData('asset_id', '');
                                                setAssetSearch('');
                                            }}
                                            className={`group relative border rounded-xl p-4 text-left transition-all duration-200 ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-100'
                                                    : 'border-border hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`rounded-lg p-2 w-fit mb-2 ${isSelected ? 'bg-emerald-100' : 'bg-muted/50 group-hover:bg-emerald-50'}`}>
                                                <Package className={`h-4 w-4 ${isSelected ? 'text-emerald-600' : 'text-muted-foreground group-hover:text-emerald-500'}`} />
                                            </div>
                                            <div className={`font-semibold text-sm ${isSelected ? 'text-emerald-800' : 'text-foreground'}`}>{cat.name}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">{count} available</div>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {categories.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-6">No asset categories found.</div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Choose Asset */}
                    {selectedCategoryId && (
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-6 py-4 flex items-center gap-3">
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">2</span>
                                <h2 className="text-lg font-semibold text-blue-900">Choose Asset</h2>
                                <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    {filteredAssets.length} available
                                </Badge>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, asset tag, brand, or serial number..."
                                        className="pl-9 h-10 border-blue-200 focus:border-blue-400"
                                        value={assetSearch}
                                        onChange={(e) => setAssetSearch(e.target.value)}
                                    />
                                </div>

                                {/* Asset List */}
                                <div className="max-h-[320px] overflow-y-auto border rounded-xl divide-y bg-white">
                                    {filteredAssets.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-muted-foreground">
                                            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                                            <p className="font-medium">No available assets</p>
                                            <p className="text-xs mt-1">Try a different category or search term</p>
                                        </div>
                                    ) : (
                                        filteredAssets.map(asset => {
                                            const isSelected = data.asset_id === asset.id.toString();
                                            return (
                                                <button
                                                    key={asset.id}
                                                    type="button"
                                                    onClick={() => setData('asset_id', asset.id.toString())}
                                                    className={`w-full flex items-center gap-4 p-4 text-left transition-all duration-150 ${
                                                        isSelected
                                                            ? 'bg-blue-50/80 border-l-[3px] border-l-blue-500'
                                                            : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                                                    }`}
                                                >
                                                    <div className={`shrink-0 rounded-lg p-2.5 ${isSelected ? 'bg-blue-100' : 'bg-muted/50'}`}>
                                                        <Monitor className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold text-sm ${isSelected ? 'text-blue-800' : 'text-foreground'}`}>
                                                                {asset.product_name}
                                                            </span>
                                                            {asset.brand && (
                                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{asset.brand}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                                            <span className="font-mono font-medium text-emerald-600">{asset.asset_id}</span>
                                                            {asset.serial_number && <span>SN: {asset.serial_number}</span>}
                                                            {asset.site && (
                                                                <span className="flex items-center gap-0.5">
                                                                    <MapPin className="h-3 w-3" /> {asset.site.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isSelected ? (
                                                        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                                                    ) : (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] shrink-0">
                                                            Available
                                                        </Badge>
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                                <InputError message={errors.asset_id} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Checkout Details */}
                    {data.asset_id && (
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b px-6 py-4 flex items-center gap-3">
                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-violet-600 text-white text-xs font-bold shadow-sm">3</span>
                                <h2 className="text-lg font-semibold text-violet-900">Checkout Details</h2>
                            </div>
                            <div className="p-6 space-y-5">
                                {/* Selected asset summary */}
                                {selectedAsset && (
                                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-4 flex items-center gap-4">
                                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shadow-md shadow-emerald-200">
                                            <Package className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-emerald-900">{selectedAsset.product_name}</div>
                                            <div className="flex items-center gap-3 text-xs text-emerald-700/70 mt-0.5">
                                                <span className="font-mono font-semibold">{selectedAsset.asset_id}</span>
                                                {selectedAsset.brand && <span>• {selectedAsset.brand}</span>}
                                                {selectedAsset.site && (
                                                    <span className="flex items-center gap-0.5">
                                                        <MapPin className="h-3 w-3" /> {selectedAsset.site.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-600 text-white text-xs">Selected</Badge>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                            Checkout Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.checkout_date}
                                            className="bg-muted/30 border-violet-200"
                                            disabled
                                        />
                                        <p className="text-[11px] text-muted-foreground">Auto-set to today</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                            Expected Return Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={data.expected_return}
                                            onChange={(e) => setData('expected_return', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="border-violet-200 focus:border-violet-400"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Optional — leave blank for indefinite</p>
                                        <InputError message={errors.expected_return} />
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Purpose / Reason <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="Describe why you need this asset, e.g., project deployment, client presentation..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="min-h-[100px] resize-y border-violet-200 focus:border-violet-400"
                                        required
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end space-x-3 pt-5 border-t border-dashed">
                                    <Button type="button" variant="outline" onClick={() => router.get('/checkout')}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.asset_id || !data.reason.trim()}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 px-6"
                                    >
                                        <ArrowDownToLine className="mr-2 h-4 w-4" /> Confirm Checkout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}

Checkout.layout = {
    breadcrumbs: [
        { title: 'Check Out / Check In', href: '/checkout' },
        { title: 'Check Out', href: '/checkout/new' },
    ],
};
