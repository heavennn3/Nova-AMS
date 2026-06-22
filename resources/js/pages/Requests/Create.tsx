import * as React from 'react';
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
import { ArrowLeft, Send } from 'lucide-react';
import InputError from '@/components/input-error';

export default function RequestsCreate({
    assets = [],
    categories = [],
    licenses = [],
}: {
    assets: any[];
    categories: any[];
    licenses: any[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        request_type: '',
        priority: 'Normal',
        asset_id: '',
        asset_category_id: '',
        required_from: '',
        required_until: '',
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const postData = {
            ...data,
            asset_id: data.asset_id === 'none' || data.asset_id === '' ? null : data.asset_id,
            asset_category_id: data.asset_category_id === 'none' || data.asset_category_id === '' ? null : data.asset_category_id,
        };

        router.post(route('requests.store'), postData);
    };

    const needsAsset = ['Borrow', 'Checkout'].includes(data.request_type);
    const needsDuration = ['Borrow', 'Checkout'].includes(data.request_type);
    const needsCategory = ['Maintenance Request', 'Purchase Request'].includes(data.request_type);

    const requestTypeDescriptions: Record<string, string> = {
        'Borrow': 'Temporarily borrow an asset. You must return it by the end date.',
        'Checkout': 'Check out an asset for use. You must return it when done.',
        'Software License': 'Request a software license key or subscription.',
        'Maintenance Request': 'Request maintenance or repair for an asset.',
        'Purchase Request': 'Request the purchase of a new asset or equipment.',
    };

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

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted/30 border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Request Details</h2>
                    </div>
                    <form onSubmit={submit} className="p-6 space-y-6">
                        {/* Request Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Request Type <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['Borrow', 'Checkout', 'Software License', 'Maintenance Request', 'Purchase Request'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setData('request_type', type)}
                                        className={`border rounded-lg p-3 text-left transition-all text-sm ${
                                            data.request_type === type
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold text-primary'
                                                : 'border-border hover:border-muted-foreground hover:bg-muted/30 text-foreground'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            {data.request_type && (
                                <p className="text-xs text-muted-foreground mt-1 pl-1">
                                    {requestTypeDescriptions[data.request_type]}
                                </p>
                            )}
                            <InputError message={errors.request_type} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Priority */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Priority <span className="text-red-500">*</span></Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger className="w-full">
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

                            {/* Specific Asset — show for Borrow/Checkout */}
                            {needsAsset && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Select Asset</Label>
                                    <Select value={data.asset_id} onValueChange={(val) => setData('asset_id', val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose an asset..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— Any Available —</SelectItem>
                                            {assets.map((asset) => (
                                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                                    {asset.product_name} ({asset.asset_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Leave empty if you don't need a specific asset</p>
                                    <InputError message={errors.asset_id} />
                                </div>
                            )}

                            {/* Category — show for Maintenance/Purchase */}
                            {needsCategory && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Category</Label>
                                    <Select value={data.asset_category_id} onValueChange={(val) => setData('asset_category_id', val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— Any —</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.asset_category_id} />
                                </div>
                            )}
                        </div>

                        {/* Duration — show for Borrow/Checkout */}
                        {needsDuration && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Reason / Justification <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="Explain why you need this..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="min-h-[120px] resize-y"
                                required
                            />
                            <InputError message={errors.reason} />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => router.get('/requests')}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.request_type}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <Send className="mr-2 h-4 w-4" /> Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
