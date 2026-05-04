import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AssetCreate({ categories, types, vendors, sites }: any) {
    const defaultSiteId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('site_id') || '' : '';

    const { data, setData, post, processing, errors } = useForm({
        asset_id: '',
        category_id: '',
        type_id: '',
        site_id: defaultSiteId, // Location
        quantity: 1,
        vendor_id: '',
        product_name: '',
        purchase_year: '',
        status: 'available',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/assets');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <Head title="Register Asset" />
            
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Register New Asset</h1>
                <Link href="/assets">
                    <Button variant="outline">Back to Inventory</Button>
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="asset_id">Asset ID (e.g., ATM-543129)</Label>
                        <Input
                            id="asset_id"
                            value={data.asset_id}
                            onChange={(e) => setData('asset_id', e.target.value)}
                            required
                        />
                        {errors.asset_id && <div className="text-sm text-red-500">{errors.asset_id}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product_name">Product Name</Label>
                        <Input
                            id="product_name"
                            value={data.product_name}
                            onChange={(e) => setData('product_name', e.target.value)}
                            required
                        />
                        {errors.product_name && <div className="text-sm text-red-500">{errors.product_name}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_id">Location (Site)</Label>
                        <Select onValueChange={(val) => setData('site_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location (e.g., Tawau, Sibu)" />
                            </SelectTrigger>
                            <SelectContent>
                                {sites?.map((site: any) => (
                                    <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.site_id && <div className="text-sm text-red-500">{errors.site_id}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select onValueChange={(val) => setData('category_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type_id">Type</Label>
                        <Select onValueChange={(val) => setData('type_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types?.map((type: any) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vendor_id">Vendor</Label>
                        <Select onValueChange={(val) => setData('vendor_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors?.map((vendor: any) => (
                                    <SelectItem key={vendor.id} value={vendor.id.toString()}>{vendor.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={data.quantity}
                            onChange={(e) => setData('quantity', parseInt(e.target.value))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="purchase_year">Purchase Year</Label>
                        <Input
                            id="purchase_year"
                            type="number"
                            min="1990"
                            max="2030"
                            value={data.purchase_year}
                            onChange={(e) => setData('purchase_year', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="in_use">In Use</SelectItem>
                                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                <SelectItem value="faulty">Faulty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={processing} className="w-full md:w-auto">
                        Register Asset
                    </Button>
                </div>
            </form>
        </div>
    );
}
AssetCreate.layout = {
    breadcrumbs: [
        {
            title: 'Register Asset',
            href: '#',
        },
    ],
};
