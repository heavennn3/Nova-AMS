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
import { ArrowLeft, Send, Package, Monitor, Key, Wrench, ShoppingCart, Search } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';

export default function RequestsCreate({
    assetTypes = [],
    assets = [],
    categories = [],
    licenses = [],
}: {
    assetTypes: any[];
    assets: any[];
    categories: any[];
    licenses: any[];
}) {
    const { data, setData, processing, errors } = useForm({
        request_type: '',
        priority: 'Normal',
        asset_id: '',
        asset_category_id: '',
        required_from: '',
        required_until: '',
        reason: '',
    });

    // For asset type filtering
    const [selectedAssetTypeId, setSelectedAssetTypeId] = useState('');
    const [assetSearch, setAssetSearch] = useState('');
    // For license selection
    const [selectedLicenseId, setSelectedLicenseId] = useState('');

    // Filter assets by selected type and search
    const filteredAssets = useMemo(() => {
        let list = assets;
        if (selectedAssetTypeId) {
            list = list.filter(a => a.type_id?.toString() === selectedAssetTypeId);
        }
        if (assetSearch) {
            list = list.filter(a =>
                a.product_name?.toLowerCase().includes(assetSearch.toLowerCase()) ||
                a.asset_id?.toLowerCase().includes(assetSearch.toLowerCase())
            );
        }
        return list;
    }, [assets, selectedAssetTypeId, assetSearch]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const postData: any = {
            ...data,
            asset_id: data.asset_id === 'none' || data.asset_id === '' ? null : data.asset_id,
            asset_category_id: data.asset_category_id === 'none' || data.asset_category_id === '' ? null : data.asset_category_id,
        };

        // Include license info in reason if software license
        if (data.request_type === 'Software License' && selectedLicenseId) {
            const lic = licenses.find(l => l.id.toString() === selectedLicenseId);
            if (lic) {
                postData.reason = `[License: ${lic.name}] ${data.reason}`;
            }
        }

        router.post('/requests', postData);
    };

    const needsAsset = ['Borrow', 'Checkout'].includes(data.request_type);
    const needsDuration = ['Borrow', 'Checkout'].includes(data.request_type);
    const needsCategory = ['Maintenance Request', 'Purchase Request'].includes(data.request_type);
    const isLicense = data.request_type === 'Software License';

    const typeCards = [
        { value: 'Borrow', label: 'Borrow', desc: 'Temporarily borrow an asset. Must be returned.', icon: Package, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        { value: 'Software License', label: 'Software License', desc: 'Request a software license or subscription.', icon: Key, color: 'text-violet-600 bg-violet-50 border-violet-200' },
        { value: 'Maintenance Request', label: 'Maintenance', desc: 'Request maintenance or repair.', icon: Wrench, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        { value: 'Purchase Request', label: 'Purchase', desc: 'Request purchase of new equipment.', icon: ShoppingCart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    ];

    return (
        <>
            <Head title="New Request" />

            <div className="flex flex-col space-y-6 max-w-3xl mx-auto p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Request</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Submit a request for an asset, software, or service
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Step 1: Request Type */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 1</Badge>
                            <h2 className="text-lg font-semibold">What do you need?</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {typeCards.map(t => {
                                    const isSelected = data.request_type === t.value;
                                    return (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => {
                                                setData(prev => ({
                                                    ...prev,
                                                    request_type: t.value,
                                                    asset_id: '',
                                                    asset_category_id: '',
                                                }));
                                                setSelectedAssetTypeId('');
                                                setAssetSearch('');
                                                setSelectedLicenseId('');
                                            }}
                                            className={`border rounded-xl p-4 text-left transition-all ${
                                                isSelected
                                                    ? `${t.color} ring-2 ring-offset-1`
                                                    : 'border-border hover:border-muted-foreground hover:bg-muted/30 text-foreground'
                                            }`}
                                        >
                                            <t.icon className={`h-5 w-5 mb-2 ${isSelected ? '' : 'text-muted-foreground'}`} />
                                            <div className="font-semibold text-sm">{t.label}</div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.request_type} className="mt-2" />
                        </div>
                    </div>

                    {/* Step 2: Asset / License Selection */}
                    {data.request_type && (
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 2</Badge>
                                <h2 className="text-lg font-semibold">
                                    {isLicense ? 'Select License' : needsAsset ? 'Select Asset' : 'Details'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Borrow / Checkout — pick asset type then asset */}
                                {needsAsset && (
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
                                                    <SelectValue placeholder="Choose asset type first..." />
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
                                                            No available assets of this type.
                                                        </div>
                                                    ) : (
                                                        filteredAssets.map(asset => (
                                                            <button
                                                                key={asset.id}
                                                                type="button"
                                                                onClick={() => setData('asset_id', asset.id.toString())}
                                                                className={`w-full flex items-center justify-between p-3 text-left text-sm transition-colors ${
                                                                    data.asset_id === asset.id.toString()
                                                                        ? 'bg-primary/5 border-l-2 border-l-primary'
                                                                        : 'hover:bg-muted/30'
                                                                }`}
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{asset.product_name}</div>
                                                                    <div className="text-xs text-muted-foreground font-mono">{asset.asset_id}</div>
                                                                </div>
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

                                {/* Software License — pick license */}
                                {isLicense && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Select License <span className="text-red-500">*</span></Label>
                                        <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                                            {licenses.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No licenses with available seats.
                                                </div>
                                            ) : (
                                                licenses.map(lic => (
                                                    <button
                                                        key={lic.id}
                                                        type="button"
                                                        onClick={() => setSelectedLicenseId(lic.id.toString())}
                                                        className={`w-full flex items-center justify-between p-3 text-left text-sm transition-colors ${
                                                            selectedLicenseId === lic.id.toString()
                                                                ? 'bg-violet-50 border-l-2 border-l-violet-500'
                                                                : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="font-medium">{lic.name}</div>
                                                            {lic.category && (
                                                                <div className="text-xs text-muted-foreground">{lic.category}</div>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 text-xs">
                                                            {lic.available_seats} seat(s)
                                                        </Badge>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Category for Maintenance / Purchase */}
                                {needsCategory && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Category</Label>
                                        <Select value={data.asset_category_id} onValueChange={(val) => setData('asset_category_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">— Any —</SelectItem>
                                                {categories.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.asset_category_id} />
                                    </div>
                                )}

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Priority <span className="text-red-500">*</span></Label>
                                    <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.priority} />
                                </div>

                                {/* Duration for Borrow/Checkout */}
                                {needsDuration && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Required From <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="date"
                                                value={data.required_from}
                                                onChange={(e) => setData('required_from', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <InputError message={errors.required_from} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Required Until <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="date"
                                                value={data.required_until}
                                                onChange={(e) => setData('required_until', e.target.value)}
                                                min={data.required_from || new Date().toISOString().split('T')[0]}
                                            />
                                            <InputError message={errors.required_until} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Reason */}
                    {data.request_type && (
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 3</Badge>
                                <h2 className="text-lg font-semibold">Justification</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Reason <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="Explain why you need this..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="min-h-[100px] resize-y"
                                        required
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => router.get('/requests')}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.request_type || (needsAsset && !data.asset_id) || (isLicense && !selectedLicenseId)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    >
                                        <Send className="mr-2 h-4 w-4" /> Submit Request
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

RequestsCreate.layout = {
    breadcrumbs: [
        { title: 'Requests', href: '/requests' },
        { title: 'New Request', href: '/requests/create' },
    ],
};
