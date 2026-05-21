import { useForm, Link, Head } from '@inertiajs/react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Package } from 'lucide-react';

export default function Edit({
    asset,
    categories,
    types,
    vendors,
    sites,
    locations,
}: any) {
    const { data, setData, put, processing, errors } = useForm({
        asset_id: asset.asset_id || '',
        serial_number: asset.serial_number || '',
        product_name: asset.product_name || '',
        brand: asset.brand || '',
        category_id: asset.category_id?.toString() || '',
        type_id: asset.type_id?.toString() || '',
        vendor_id: asset.vendor_id?.toString() || '',
        site_id: asset.site_id?.toString() || '',
        purchase_year: asset.purchase_year || '',
        status: asset.status || 'available',
        condition_status: asset.condition_status || 'good',
        notes: asset.notes || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/assets/${asset.id}`);
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title={`Edit Asset - ${asset.asset_id}`} />

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/assets">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Asset
                        </h1>
                        <p className="text-muted-foreground">
                            Update detailed information for this asset.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <Package className="mr-1 h-3 w-3" />
                        ID: {asset.asset_id}
                    </div>
                </div>
            </div>

            <form
                onSubmit={submit}
                className="grid grid-cols-1 gap-6 md:grid-cols-3"
            >
                {/* Basic Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Asset Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="asset_id">Asset ID *</Label>
                                <Input
                                    id="asset_id"
                                    value={data.asset_id}
                                    onChange={(e) =>
                                        setData('asset_id', e.target.value)
                                    }
                                    required
                                />
                                {errors.asset_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.asset_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">
                                    Serial Number
                                </Label>
                                <Input
                                    id="serial_number"
                                    value={data.serial_number}
                                    onChange={(e) =>
                                        setData('serial_number', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_name">
                                    Product Name *
                                </Label>
                                <Input
                                    id="product_name"
                                    value={data.product_name}
                                    onChange={(e) =>
                                        setData('product_name', e.target.value)
                                    }
                                    required
                                />
                                {errors.product_name && (
                                    <p className="text-xs text-red-500">
                                        {errors.product_name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={data.brand}
                                    onChange={(e) =>
                                        setData('brand', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) =>
                                        setData('category_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c: any) => (
                                            <SelectItem
                                                key={c.id}
                                                value={c.id.toString()}
                                            >
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={data.type_id}
                                    onValueChange={(val) =>
                                        setData('type_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {types.map((t: any) => (
                                            <SelectItem
                                                key={t.id}
                                                value={t.id.toString()}
                                            >
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Enter any maintenance notes or descriptions..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Status & Lifecycle */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operational Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>System Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(val) =>
                                        setData('status', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="in_use">
                                            In Use
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Maintenance
                                        </SelectItem>
                                        <SelectItem value="faulty">
                                            Faulty Unit
                                        </SelectItem>
                                        <SelectItem value="degraded">
                                            Degraded Unit
                                        </SelectItem>
                                        <SelectItem value="new">
                                            New Unit
                                        </SelectItem>
                                        <SelectItem value="retired">
                                            Retired
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Condition Status</Label>
                                <Select
                                    value={data.condition_status}
                                    onValueChange={(val) =>
                                        setData('condition_status', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">
                                            Brand New
                                        </SelectItem>
                                        <SelectItem value="excellent">
                                            Excellent
                                        </SelectItem>
                                        <SelectItem value="good">
                                            Good
                                        </SelectItem>
                                        <SelectItem value="fair">
                                            Fair
                                        </SelectItem>
                                        <SelectItem value="degraded">
                                            Degraded
                                        </SelectItem>
                                        <SelectItem value="poor">
                                            Poor
                                        </SelectItem>
                                        <SelectItem value="faulty">
                                            Faulty
                                        </SelectItem>
                                        <SelectItem value="damaged">
                                            Damaged
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Site</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Assigned Site</Label>
                                <Select
                                    value={data.site_id}
                                    onValueChange={(val) =>
                                        setData('site_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map((s: any) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id.toString()}
                                            >
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchase_year">
                                    Purchase Year
                                </Label>
                                <Input
                                    id="purchase_year"
                                    type="number"
                                    value={data.purchase_year}
                                    onChange={(e) =>
                                        setData('purchase_year', e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        className="h-12 w-full"
                        disabled={processing}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing
                            ? 'Saving Changes...'
                            : 'Save Asset Details'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Edit',
            href: '#',
        },
    ],
};
