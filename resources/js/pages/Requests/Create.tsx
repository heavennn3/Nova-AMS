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
import { ArrowLeft, Send, Key } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';

export default function RequestsCreate({
    licenses = [],
}: {
    assetTypes?: any[];
    assets?: any[];
    categories?: any[];
    licenses: any[];
    sites?: any[];
    isAdmin?: boolean;
    userSiteId?: number | null;
}) {
    const { data, setData, processing, errors } = useForm({
        request_type: 'Software License',
        priority: 'Normal',
        asset_id: '',
        asset_category_id: '',
        license_id: '',
        required_from: '',
        required_until: '',
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const postData: any = {
            ...data,
            license_id: data.license_id || null,
        };

        router.post('/requests', postData);
    };

    const isLicense = data.request_type === 'Software License';

    return (
        <>
            <Head title="New Request" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">New Request</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Submit a request for software or other services.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Select License */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 1</Badge>
                            <h2 className="text-lg font-semibold">What do you need?</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Request Type</Label>
                                <div className="border rounded-lg p-4 bg-muted/20 text-sm font-medium flex items-center gap-3">
                                    <Key className="h-5 w-5 text-violet-600" />
                                    Software License
                                </div>
                            </div>

                            {/* License Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Select License <span className="text-red-500">*</span></Label>
                                <div className="max-h-[300px] overflow-y-auto border rounded-lg divide-y">
                                    {licenses.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No licenses with available seats.
                                        </div>
                                    ) : (
                                        licenses.map((lic: any) => (
                                            <button
                                                key={lic.id}
                                                type="button"
                                                onClick={() => setData('license_id', lic.id.toString())}
                                                className={`w-full flex items-center justify-between p-3 text-left text-sm transition-colors ${data.license_id === lic.id.toString()
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
                                <InputError message={errors.license_id} />
                            </div>

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
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="bg-muted/30 border-b px-6 py-4 flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Step 2</Badge>
                            <h2 className="text-lg font-semibold">Justification</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Reason <span className="text-red-500">*</span></Label>
                                <Textarea
                                    placeholder="Explain why you need this license..."
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
                                    disabled={processing || !data.license_id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    <Send className="mr-2 h-4 w-4" /> Submit Request
                                </Button>
                            </div>
                        </div>
                    </div>
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
