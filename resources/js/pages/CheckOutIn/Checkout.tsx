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

            <div className="space-y-6 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Check Out Asset</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Select a category, choose an asset, then confirm checkout
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.get('/checkout')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                {/* Checkout Person */}
                <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Checkout Person</div>
                        <div className="font-semibold text-sm">{currentUser.name} <span className="font-normal text-muted-foreground">({currentUser.email})</span></div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: Category */}
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="border-b px-5 py-3 flex items-center gap-2 bg-muted/30">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold">1</span>
                            <h2 className="font-semibold text-sm">Asset Category</h2>
                        </div>
                        <div className="p-5">
                            <Select
                                value={selectedCategoryId}
                                onValueChange={(val) => {
                                    setSelectedCategoryId(val);
                                    setData('asset_id', '');
                                    setAssetSearch('');
                                }}
                            >
                                <SelectTrigger className="w-full max-w-sm">
                                    <SelectValue placeholder="Select category (e.g. Monitor, Server)..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name} — {categoryCount(cat.id.toString())} available
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Step 2: Choose Asset */}
                    {selectedCategoryId && (
                        <div className="rounded-lg border bg-card overflow-hidden">
                            <div className="border-b px-5 py-3 flex items-center gap-2 bg-muted/30">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold">2</span>
                                <h2 className="font-semibold text-sm">Choose Asset</h2>
                                <span className="text-xs text-muted-foreground ml-auto">{filteredAssets.length} available</span>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search name, tag, brand, serial..."
                                        className="pl-8 h-9"
                                        value={assetSearch}
                                        onChange={(e) => setAssetSearch(e.target.value)}
                                    />
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/40 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left w-10"></th>
                                                <th className="px-4 py-2.5 text-left">Asset Tag</th>
                                                <th className="px-4 py-2.5 text-left">Name</th>
                                                <th className="px-4 py-2.5 text-left">Brand</th>
                                                <th className="px-4 py-2.5 text-left">Serial No.</th>
                                                <th className="px-4 py-2.5 text-left">Site</th>
                                                <th className="px-4 py-2.5 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredAssets.map(asset => {
                                                const isSelected = data.asset_id === asset.id.toString();
                                                return (
                                                    <tr
                                                        key={asset.id}
                                                        onClick={() => setData('asset_id', asset.id.toString())}
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-2.5">
                                                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                                            }`}>
                                                                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 font-mono text-xs font-medium text-emerald-700">{asset.asset_id}</td>
                                                        <td className="px-4 py-2.5 font-medium">{asset.product_name}</td>
                                                        <td className="px-4 py-2.5 text-muted-foreground">{asset.brand || '—'}</td>
                                                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{asset.serial_number || '—'}</td>
                                                        <td className="px-4 py-2.5 text-muted-foreground">{asset.site?.name || '—'}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className="text-[11px] rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5">Available</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredAssets.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                                        No available assets in this category.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <InputError message={errors.asset_id} />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {data.asset_id && (
                        <div className="rounded-lg border bg-card overflow-hidden">
                            <div className="border-b px-5 py-3 flex items-center gap-2 bg-muted/30">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-foreground text-background text-[10px] font-bold">3</span>
                                <h2 className="font-semibold text-sm">Checkout Details</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Selected asset */}
                                {selectedAsset && (
                                    <div className="rounded-lg border bg-muted/20 p-3 text-sm flex items-center gap-3">
                                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-medium">{selectedAsset.product_name}</span>
                                        <span className="font-mono text-xs text-emerald-700">{selectedAsset.asset_id}</span>
                                        {selectedAsset.brand && <span className="text-muted-foreground">• {selectedAsset.brand}</span>}
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4 max-w-lg">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Checkout Date</Label>
                                        <Input type="date" value={data.checkout_date} disabled className="bg-muted/30" />
                                        <p className="text-[11px] text-muted-foreground">Today</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Expected Return</Label>
                                        <Input
                                            type="date"
                                            value={data.expected_return}
                                            onChange={(e) => setData('expected_return', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <p className="text-[11px] text-muted-foreground">Leave blank for indefinite</p>
                                        <InputError message={errors.expected_return} />
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div className="space-y-1.5 max-w-lg">
                                    <Label className="text-sm font-medium">Purpose <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="e.g. Project deployment, client presentation, development work..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="min-h-[80px] resize-y"
                                        required
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                {/* Submit */}
                                <div className="flex space-x-3 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => router.get('/checkout')}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.asset_id || !data.reason.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
