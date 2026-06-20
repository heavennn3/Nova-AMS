import * as React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';

export default function RequestsCreate({
    assets = [],
    categories = [],
}: {
    assets: any[];
    categories: any[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        request_type: 'Borrow',
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
            asset_id: data.asset_id === 'none' ? null : data.asset_id,
            asset_category_id: data.asset_category_id === 'none' ? null : data.asset_category_id,
        };
        
        // Use Inertia router instead of post from useForm since we are transforming data
        router.post(route('requests.store'), postData);
    };

    return (
        <>
            <Head title="New Request" />

            <div className="flex flex-col space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Request</h1>
                        <p className="text-sm text-muted-foreground">
                            Submit a request for an asset
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-6 space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="request_type" className="text-sm font-semibold text-slate-700">Request Type <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.request_type}
                                    onValueChange={(val) => setData('request_type', val)}
                                >
                                    <SelectTrigger id="request_type" className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Borrow">Borrow</SelectItem>
                                        <SelectItem value="Maintenance Request">Maintenance Request</SelectItem>
                                        <SelectItem value="Purchase Request">Purchase Request</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.request_type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">Priority <span className="text-red-500">*</span></Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(val) => setData('priority', val)}
                                >
                                    <SelectTrigger id="priority" className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
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

                            <div className="space-y-2">
                                <Label htmlFor="asset_id" className="text-sm font-semibold text-slate-700">Specific Asset (optional)</Label>
                                <Select
                                    value={data.asset_id}
                                    onValueChange={(val) => setData('asset_id', val)}
                                >
                                    <SelectTrigger id="asset_id" className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="— Any —" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Any —</SelectItem>
                                        {assets.map((asset) => (
                                            <SelectItem key={asset.id} value={asset.id.toString()}>
                                                {asset.product_name} ({asset.asset_id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">Leave empty if requesting from a category</p>
                                <InputError message={errors.asset_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="asset_category_id" className="text-sm font-semibold text-slate-700">Category (optional)</Label>
                                <Select
                                    value={data.asset_category_id}
                                    onValueChange={(val) => setData('asset_category_id', val)}
                                >
                                    <SelectTrigger id="asset_category_id" className="w-full bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="— Any —" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Any —</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.asset_category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="required_from" className="text-sm font-semibold text-slate-700">Required From</Label>
                                <Input
                                    id="required_from"
                                    type="date"
                                    value={data.required_from}
                                    onChange={(e) => setData('required_from', e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                                <InputError message={errors.required_from} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="required_until" className="text-sm font-semibold text-slate-700">Required Until</Label>
                                <Input
                                    id="required_until"
                                    type="date"
                                    value={data.required_until}
                                    onChange={(e) => setData('required_until', e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                                <InputError message={errors.required_until} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-sm font-semibold text-slate-700">Reason <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why you need this asset..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-y"
                                required
                            />
                            <InputError message={errors.reason} />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get('/requests')}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-sm"
                            >
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
