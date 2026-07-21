import { useForm, Link, Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function AssetEdit({
    asset,
    categories = [],
    types = [],
    oems = [],
}: any) {
    const { data, setData, put, processing, errors } = useForm<Record<string, string | number>>({
        asset_id: asset.asset_id || '',
        asset_name: asset.asset_name || '',
        category_id: asset.category_id?.toString() || '',
        type_id: asset.type_id?.toString() || '',
        oem_id: asset.oem_id?.toString() || '',
        location: asset.location || '',
        purchase_year: asset.purchase_year?.toString() || '',
        serial_number: asset.serial_number || '',
        part_number: asset.part_number || '',
        quantity: asset.quantity?.toString() || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/assets/${asset.id}`, {
            preserveScroll: true,
        });
    };

    const renderField = (key: string, label: string, required = false, type = 'text') => (
        <div className="space-y-2">
            <Label htmlFor={key} className="font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
                id={key}
                type={type}
                value={data[key] || ''}
                onChange={(e) => setData(key, e.target.value)}
                className="h-9"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto p-8">
            <Head title="Edit Asset" />

            <div className="mb-6">
                <Link href="/asset-inventory" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Assets
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Edit Asset</h1>
                <p className="text-sm text-muted-foreground mt-1">Update asset details.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="rounded-lg border bg-card p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField('asset_id', 'Asset ID', true)}
                        {renderField('asset_name', 'Asset Name')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category_id" className="font-medium">Category</Label>
                            <Select
                                value={data.category_id?.toString() || ''}
                                onValueChange={(val) => setData('category_id', val)}
                            >
                                <SelectTrigger id="category_id">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type_id" className="font-medium">Type</Label>
                            <Select
                                value={data.type_id?.toString() || ''}
                                onValueChange={(val) => setData('type_id', val)}
                            >
                                <SelectTrigger id="type_id">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((t: any) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="oem_id" className="font-medium">OEM</Label>
                            <Select
                                value={data.oem_id?.toString() || ''}
                                onValueChange={(val) => setData('oem_id', val)}
                            >
                                <SelectTrigger id="oem_id">
                                    <SelectValue placeholder="Select OEM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {oems.map((o: any) => (
                                        <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField('location', 'Location')}
                        {renderField('purchase_year', 'Purchase Year', false, 'number')}
                        {renderField('serial_number', 'Serial Number')}
                        {renderField('part_number', 'Part Number')}
                        {renderField('quantity', 'Quantity', false, 'number')}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link href="/asset-inventory">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
